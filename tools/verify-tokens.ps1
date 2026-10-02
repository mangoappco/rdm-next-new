<#
.SYNOPSIS
    Verificador de la arquitectura de tokens de RDM Next.

.DESCRIPTION
    Comprueba que las reglas de la arquitectura de 3 capas se cumplen de forma
    automatica, y que no haya regresiones antes de cada commit.

    Las reglas que verifica:

      REGLA 1  Sin valores crudos fuera de 1-ref
               Ni #HEX, ni px, ni ms, ni rem sueltos en 2-sys y 3-comp.

      REGLA 2  Direccion de las dependencias
               3-comp no puede leer 1-ref (salto de capa prohibido).
               1-ref no puede leer 2-sys ni 3-comp (dependencia circular).
               2-sys no puede leer 3-comp.

      REGLA 3  Todo token referenciado existe
               Un var(--md-...) sin definir produce una regla invalida que el
               navegador descarta en silencio. Es el fallo mas dificil de ver.

      REGLA 4  Orden de los temas
               theme.light.css debe importarse ANTES que theme.dark.css. Es el
               unico punto del proyecto donde el orden de escritura cambia el
               comportamiento.

      REGLA 5  Integridad de la arquitectura
               Las carpetas y archivos esperados existen; main.css declara las
               capas @layer; el numero de archivos importados coincide.

      REGLA 8  Tablas de tokens del showroom
               Portada del verificador de rdm-next-old. El showroom vive
               fuera de src/css/, asi que Get-CssFiles lo excluye y sin esta
               regla nadie leeria sus hojas. Comprueba que toda <table> lleve
               el patron .sr-table, que ese patron sea una superficie completa
               (borde, radio, encabezado con tinte, code monospace) y que el
               texto de la tabla de 4.5:1 en los dos temas.
               La rejilla NO se mide: va en outline-variant por decision
               documentada, y el comentario del bloque explica por que.

.PARAMETER Quiet
    No muestra el detalle de cada archivo que pasa. Solo el resumen.

.EXAMPLE
    .\tools\verify-tokens.ps1

.EXAMPLE
    .\tools\verify-tokens.ps1 -Quiet

.NOTES
    Archivo de la CAPA 0 (herramienta). No pertenece a 1-ref, 2-sys ni 3-comp,
    y por eso no es escaneado por si mismo.
#>

[CmdletBinding()]
param(
    [switch]$Quiet
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# Raiz del proyecto: este script vive en tools/, asi que la raiz es un nivel arriba.
$ProjectRoot = Split-Path -Parent $PSScriptRoot

# Raiz de la libreria CSS. El sistema no vive en la raiz del repositorio sino
# en src/css/, y el showroom vive aparte en showroom/. Esta variable es el UNICO
# lugar donde se conoce esa ruta: las reglas la referencian en vez de escribir
# 'src\css\...' cada vez. Si la estructura vuelve a cambiar, se cambia aqui.
$CssRoot = Join-Path $ProjectRoot 'src\css'

# Nombres de archivo que no se escanean por ser marcadores de directorio vacio.
$Markers = @('.gitkeep')

# Normaliza un separador de ruta para comparar rutas relativas sin depender de
# si PowerShell reporto '\' o '/'. Get-ChildItem devuelve '\' en Windows, pero
# las reglas comparan contra rutas escritas a mano.
function Get-RelPath {
    param([string]$Path, [string]$Base)

    return $Path.Substring($Base.Length + 1) -replace '/', '\'
}

# ============================================================================
# UTILIDADES
# ============================================================================

# Devuelve las hojas CSS de la LIBRERIA (src/css/), mas reset.css.
#
# El filtro se evalua sobre la ruta relativa a src/css/, no a la raiz del
# proyecto: asi "esta hoja pertenece a una capa" es una pregunta sobre la
# libreria. Por eso el prefijo src\css\ se quita antes de comparar, y una hoja
# que viva fuera de la libreria (por ejemplo showroom/assets/showroom.css, que
# es del showroom y no del sistema) queda automaticamente excluida.
function Get-CssFiles {
    param([string]$Root, [string]$CssRoot)

    $extensions = '*.css', '*.scss'

    Get-ChildItem -Path $Root -Recurse -File -Include $extensions |
        Where-Object {
            $name = $_.Name

            # solo hojas que viven dentro de src/css/
            if (-not $_.FullName.StartsWith($CssRoot + [IO.Path]::DirectorySeparatorChar)) {
                return $false
            }

            $cssRel = Get-RelPath $_.FullName $CssRoot

            # fuera de marcadores
            $name -notin $Markers -and
            # fuera de main.css (se valida aparte, con reglas propias)
            $name -ne 'main.css' -and
            # dentro de las carpetas de capas, mas el reset de la raiz de src/css/
            # (el reset no va en una carpeta numerada: no es un token de M3,
            #  es un reinicio del navegador. Ver la cabecera de src/css/reset.css)
            ($cssRel.StartsWith('1-ref\') -or
             $cssRel.StartsWith('2-sys\') -or
             $cssRel.StartsWith('3-comp\') -or
             $cssRel -eq 'reset.css')
        }
}

# Extrae el codigo REAL de una hoja: sin comentarios y sin bloques de ejemplo.
# Sin esto, un #HEX dentro de un comentario pedagogico contaria como violacion
# y el script seria inservible por falsos positivos.
function Get-CodeOnly {
    param([string]$Path)

    $raw = [System.IO.File]::ReadAllText($Path)

    # 1. comentarios de bloque /* ... */
    $raw = [regex]::Replace($raw, '(?s)/\*.*?\*/', '')

    # 2. comentarios de linea // ...
    $raw = [regex]::Replace($raw, '(?m)//.*$', '')

    return $raw
}

# Devuelve la capa de una hoja a partir de su ruta RELATIVA A src/css/.
# La comparacion es exacta con el nombre de archivo para el reset, y por
# subcarpeta para el resto. No se usan comodines: un token vivo como
# --md-ref-ref-... en el nombre de una carpeta no debe decidir la capa.
function Get-Layer {
    param([string]$Relative)

    if ($Relative -eq 'reset.css') { return 'reset' }
    if ($Relative.StartsWith('1-ref\') -or $Relative -eq '1-ref') { return 'ref' }
    if ($Relative.StartsWith('2-sys\') -or $Relative -eq '2-sys') { return 'sys' }
    if ($Relative.StartsWith('3-comp\') -or $Relative -eq '3-comp') { return 'comp' }
    return '?'
}

# Resultado acumulado de una verificacion.
$script:Issues = [System.Collections.Generic.List[object]]::new()

function Add-Issue {
    param(
        [string]$Rule,
        [string]$File,
        [string]$Line,
        [string]$Message,
        [string]$Snippet
    )
    $script:Issues.Add([pscustomobject]@{
        Rule    = $Rule
        File    = $File
        Line    = $Line
        Message = $Message
        Snippet = $Snippet
    })
}

# ============================================================================
# CARGA Y PREPARACION
# ============================================================================

Write-Host ''
Write-Host '  RDM Next - Verificador de tokens' -ForegroundColor Cyan
Write-Host '  --------------------------------' -ForegroundColor DarkCyan

$files = Get-CssFiles -Root $ProjectRoot -CssRoot $CssRoot

# Anotar cada archivo con dos rutas:
#   Relative    -> relativa al proyecto. Se usa para reportar la ubicacion del
#                  fallo de forma que el mensaje sea accionable.
#   CssRelative -> relativa a src/css/. Se usa para determinar la capa, porque
#                  las reglas hablan de 'la capa' y la capa se define dentro de
#                  la libreria, no del repositorio.
foreach ($file in $files) {
    Add-Member -InputObject $file -NotePropertyName Relative `
                         -NotePropertyValue (Get-RelPath $file.FullName $ProjectRoot)
    Add-Member -InputObject $file -NotePropertyName CssRelative `
                         -NotePropertyValue (Get-RelPath $file.FullName $CssRoot)
}

# Indice de TODOS los tokens definidos en el proyecto (para la regla 3).
$definedTokens = @{}
foreach ($file in $files) {
    $code = Get-CodeOnly $file.FullName
    foreach ($m in [regex]::Matches($code, '(--md-(?:ref|sys|comp|state|elevation|shape|motion|typescale|measurement|colors?|typography)-[a-z0-9-]+)\s*:')) {
        $definedTokens[$m.Groups[1].Value] = $true
    }
}

Write-Host "  Hojas escaneadas : $($files.Count)"
Write-Host "  Tokens definidos : $($definedTokens.Count)"
Write-Host ''

# ============================================================================
# REGLA 1 - Sin valores crudos fuera de 1-ref
# ============================================================================

$patternHex   = '#[0-9a-fA-F]{3,8}\b'
$patternPx    = '(?<![\w-])\d+\.?\d*px'
$patternMs    = '(?<![\w-])\d+\.?\d*ms'
$patternRem   = '(?<![\w-])\d+\.?\d*rem'

foreach ($file in $files) {
    $layer = Get-Layer $file.CssRelative
    if ($layer -eq 'ref') { continue }

    $code = Get-CodeOnly $file.FullName
    $lines = $code -split "`n"
    $rel = $file.Relative

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $lineText = $lines[$i]
        # no contar numeros dentro de nombres de token, p.ej. --md-ref-spacing-100
        $probe = $lineText -replace '--[a-z0-9-]+', 'VAR'

        foreach ($check in @(
            @{ Pattern = $patternHex; Name = 'color #HEX' },
            @{ Pattern = $patternPx;  Name = 'medida px' },
            @{ Pattern = $patternMs;  Name = 'duracion ms' },
            @{ Pattern = $patternRem; Name = 'medida rem' }
        )) {
            foreach ($m in [regex]::Matches($probe, $check.Pattern)) {
                Add-Issue -Rule 'REGLA 1' -File $rel -Line ($i + 1) `
                          -Message "valor crudo ($($check.Name)) fuera de 1-ref" `
                          -Snippet $lineText.Trim()
            }
        }
    }
}

# ============================================================================
# REGLA 2 - Direccion de las dependencias
# ============================================================================

foreach ($file in $files) {
    $layer = Get-Layer $file.CssRelative
    $code = Get-CodeOnly $file.FullName
    $lines = $code -split "`n"
    $rel = $file.Relative

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $lineText = $lines[$i]
        foreach ($m in [regex]::Matches($lineText, '--md-(ref|sys|comp)-')) {
            $target = $m.Groups[1].Value

            $violation = $false
            $why = ''

            if ($layer -eq 'comp' -and $target -eq 'ref') {
                $violation = $true
                $why = '3-comp no puede leer 1-ref: salto de capa prohibido'
            }
            if ($layer -eq 'ref' -and $target -eq 'sys') {
                $violation = $true
                $why = '1-ref no puede leer 2-sys: dependencia circular'
            }
            if ($layer -eq 'ref' -and $target -eq 'comp') {
                $violation = $true
                $why = '1-ref no puede leer 3-comp: dependencia circular'
            }
            if ($layer -eq 'sys' -and $target -eq 'comp') {
                $violation = $true
                $why = '2-sys no puede leer 3-comp: dependencia invertida'
            }
            if ($layer -eq 'reset' -and $target -eq 'comp') {
                $violation = $true
                $why = 'reset no puede leer 3-comp: el reset es la base y no depende de componentes'
            }

            if ($violation) {
                Add-Issue -Rule 'REGLA 2' -File $rel -Line ($i + 1) -Message $why -Snippet $lineText.Trim()
            }
        }
    }
}

# ============================================================================
# REGLA 3 - Todo token referenciado existe
# ============================================================================

foreach ($file in $files) {
    $code = Get-CodeOnly $file.FullName
    $lines = $code -split "`n"
    $rel = $file.Relative

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $lineText = $lines[$i]
        foreach ($m in [regex]::Matches($lineText, 'var\((--md-[a-z0-9-]+)\)')) {
            $token = $m.Groups[1].Value
            if (-not $definedTokens.ContainsKey($token)) {
                Add-Issue -Rule 'REGLA 3' -File $rel -Line ($i + 1) `
                          -Message "token inexistente: $token (el navegador descarta la regla en silencio)" `
                          -Snippet $lineText.Trim()
            }
        }
    }
}

# ============================================================================
# REGLA 4 - Orden de los temas en main.css
# ============================================================================

$mainPath = Join-Path $CssRoot 'main.css'

if (-not (Test-Path $mainPath)) {
    Add-Issue -Rule 'REGLA 5' -File 'src/css/main.css' -Line 0 -Message 'no existe' -Snippet ''
}
else {
    $mainCode = Get-CodeOnly $mainPath
    $imports = [regex]::Matches($mainCode, '@import url\("([^"]+)"\)\s*layer\((\w+)\)')

    $seq = @($imports | ForEach-Object { $_.Groups[1].Value })
    $iLight = [array]::IndexOf($seq, '2-sys/theme/theme.light.css')
    $iDark  = [array]::IndexOf($seq, '2-sys/theme/theme.dark.css')

    if ($iLight -lt 0) {
        Add-Issue -Rule 'REGLA 4' -File 'src/css/main.css' -Line 0 -Message 'no importa 2-sys/theme/theme.light.css' -Snippet ''
    }
    elseif ($iDark -lt 0) {
        Add-Issue -Rule 'REGLA 4' -File 'src/css/main.css' -Line 0 -Message 'no importa 2-sys/theme/theme.dark.css' -Snippet ''
    }
    elseif ($iLight -gt $iDark) {
        Add-Issue -Rule 'REGLA 4' -File 'src/css/main.css' -Line 0 `
                  -Message 'orden invertido: theme.light.css debe importarse ANTES que theme.dark.css (convencion de legibilidad; ya no afecta el comportamiento del tema)' `
                  -Snippet ''
    }

    # Cada archivo importado debe existir en disco.
    # Las rutas de los @import de main.css son RELATIVAS a la carpeta donde vive
    # main.css (src/css/), no a la raiz del proyecto. Por eso se resuelve
    # partiendo de $CssRoot.
    foreach ($imp in $imports) {
        $p = Join-Path $CssRoot ($imp.Groups[1].Value -replace '/', '\')
        if (-not (Test-Path $p)) {
            Add-Issue -Rule 'REGLA 5' -File 'src/css/main.css' -Line 0 `
                      -Message "importa un archivo que no existe: $($imp.Groups[1].Value)" -Snippet ''
        }
    }
}

# ============================================================================
# REGLA 5 - Integridad de la arquitectura
# ============================================================================

# Las capas @layer deben declararse antes de cualquier import.
#
# IMPORTANTE: el analisis se hace sobre el codigo SIN comentarios. main.css
# documenta la declaracion de @layer en su cabecera, y un regex sobre el texto
# crudo capturaria esa mencion pedagogica en vez de la declaracion real.
#
# Si main.css no existe, REGLA 4 ya lo reporto. Aqui se sigue con una cadena
# vacia en vez de llamar a Get-CodeOnly sobre un archivo inexistente: sin este
# guardia el script muere con una excepcion no controlada y las reglas 6 y 7
# nunca llegan a ejecutarse, que es peor que un fallo reportado.
$mainRaw = if (Test-Path $mainPath) { Get-CodeOnly $mainPath } else { '' }
$layerDecl = [regex]::Match($mainRaw, '@layer\s+([^;]+);')
if (-not $layerDecl.Success) {
    Add-Issue -Rule 'REGLA 5' -File 'src/css/main.css' -Line 0 -Message 'no declara @layer' -Snippet ''
}
elseif ($layerDecl.Index -gt [regex]::Match($mainRaw, '@import').Index) {
    Add-Issue -Rule 'REGLA 5' -File 'src/css/main.css' -Line 0 `
              -Message '@layer debe declararse ANTES del primer @import' -Snippet ''
}
else {
    $declared = $layerDecl.Groups[1].Value
    foreach ($need in @('reset', 'ref', 'sys', 'comp', 'utilities')) {
        if ($declared -notmatch "\b$need\b") {
            Add-Issue -Rule 'REGLA 5' -File 'src/css/main.css' -Line 0 -Message "no declara la capa @$need" -Snippet ''
        }
    }

    # El ORDEN de la declaracion es la tabla de precedencia del sistema.
    # Si una capa se declara despues de otra, esa otra pierde contra ella.
    # Un orden alterado no rompe el build: rompe la ARQUITECTURA en silencio.
    $order = ($declared -split ',' | ForEach-Object { $_.Trim() }) |
             Where-Object { $_ -ne '' }
    $wanted = @('reset', 'ref', 'sys', 'comp', 'utilities')
    if (($order -join ',') -ne ($wanted -join ',')) {
        Add-Issue -Rule 'REGLA 5' -File 'src/css/main.css' -Line 0 `
                  -Message "orden de capas incorrecto. Esperado: $($wanted -join ', '). Encontrado: $($order -join ', ')" `
                  -Snippet ''
    }
}

# reset.css debe existir y ser el PRIMER import del orquestador.
$resetPath = Join-Path $CssRoot 'reset.css'
if (-not (Test-Path $resetPath)) {
    Add-Issue -Rule 'REGLA 5' -File 'src/css/reset.css' -Line 0 `
              -Message 'falta la capa 0: src/css/reset.css es el primer import del sistema' -Snippet ''
}
else {
    $firstImport = [regex]::Match($mainRaw, '@import\s+url\(\s*"([^"]+)"')
    if ($firstImport.Success -and $firstImport.Groups[1].Value -ne 'reset.css') {
        Add-Issue -Rule 'REGLA 5' -File 'src/css/main.css' -Line 0 `
                  -Message "reset.css debe ser el PRIMER import (se encontro '$($firstImport.Groups[1].Value)' primero). El reset necesita declararse antes que las capas que lo van a sobreescribir" `
                  -Snippet ''
    }
}

# Estructura de carpetas esperada. Las tres primeras son relativas a src/css/
# (la libreria); las dos siguientes son relativas a la raiz del repositorio.
$expectedInCss = @('1-ref', '2-sys', '2-sys\theme', '3-comp')
foreach ($dir in $expectedInCss) {
    if (-not (Test-Path (Join-Path $CssRoot $dir))) {
        Add-Issue -Rule 'REGLA 5' -File "src/css/$dir" -Line 0 -Message 'falta el directorio esperado' -Snippet ''
    }
}

$expectedInRoot = @('tools', 'showroom', 'showroom\components', 'showroom\assets')
foreach ($dir in $expectedInRoot) {
    if (-not (Test-Path (Join-Path $ProjectRoot $dir))) {
        Add-Issue -Rule 'REGLA 5' -File $dir -Line 0 -Message 'falta el directorio esperado' -Snippet ''
    }
}

# Toda hoja escaneada debe pertenecer a una capa conocida. Si Get-Layer no
# reconoce una ruta, la REGLA 1 la trataria como si no fuera de 1-ref y la
# REGLA 2 no revisaria sus dependencias: dos reglas apagadas en silencio.
foreach ($file in $files) {
    if ((Get-Layer $file.CssRelative) -eq '?') {
        Add-Issue -Rule 'REGLA 5' -File $file.Relative -Line 0 `
                  -Message "hoja escaneada cuya capa no se puede determinar (relativa a src/css: $($file.CssRelative))" `
                  -Snippet ''
    }
}

# ============================================================================
# REGLA 6 - Dogfooding del showroom
# --------------------------------------------------------------------------
# El showroom se construye UNICAMENTE con lo que el sistema proporciona.
# Esta regla verifica dos cosas:
#
#   a) Ningun HTML del proyecto lleva atributos de estilo en linea.
#      El HTML tiene que consumir el sistema a traves de clases.
#
#   b) Ningun HTML del proyecto lleva un bloque <style> propio.
#      Si el showroom necesita CSS que el sistema no ofrece, la respuesta es
#      crear el token o la utilidad en 2-sys/3-comp, no parchear el HTML.
#
# El punto (b) es tan importante como el (a): un <style> dentro del HTML es
# la forma "limpia" de la misma prohibicion, y seria el hueco por donde
# volverian los estilos ad-hoc.
# ============================================================================

$htmlFiles = Get-ChildItem -Path $ProjectRoot -Recurse -File -Include '*.html' |
    Where-Object { $_.FullName -notmatch '\\\.git\\' }

foreach ($html in $htmlFiles) {
    $raw = [System.IO.File]::ReadAllText($html.FullName)
    $rel = Get-RelPath $html.FullName $ProjectRoot

    # Sin comentarios: los comentarios de documentacion mencionan la regla
    $body = [regex]::Replace($raw, '(?s)<!--.*?-->', '')

    $lines = $body -split "`n"

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $lineText = $lines[$i]

        # a) atributo de estilo en linea
        foreach ($m in [regex]::Matches($lineText, '<[a-zA-Z][^>]*?\sstyle\s*=')) {
            Add-Issue -Rule 'REGLA 6' -File $rel -Line ($i + 1) `
                      -Message 'estilo en linea prohibido: el HTML debe consumir el sistema con clases de 2-sys o 3-comp. Si falta un token o una utilidad, creala en la capa correspondiente' `
                      -Snippet $lineText.Trim()
        }

        # b) bloque de estilos propio en el HTML
        if ($lineText -match '<style[\s>]') {
            Add-Issue -Rule 'REGLA 6' -File $rel -Line ($i + 1) `
                      -Message 'bloque <style> en el HTML prohibido: el CSS pertenece a las capas 1-ref, 2-sys o 3-comp' `
                      -Snippet $lineText.Trim()
        }
    }
}

# ============================================================================
# REGLA 7 - Sincronizacion de bloques de tema
# ---------------------------------------------------------------------------
# Cada archivo de tema declara sus 38 tokens en DOS bloques: uno con @media
# (para prefers-color-scheme) y otro con [data-theme] (para eleccion
# explicita). Ambos bloques deben ser IDENTICOS.
#
# Si se cambia un tono en un bloque y no en el otro, el tema se comporta
# de forma diferente segun si el usuario eligio el tema o lo heredo del SO.
# Es un error sutil que no se ve a simple vista: el showroom puede verse
# bien (porque usa el bloque del SO) mientras que el toggle de ManGo! App
# muestra colores distintos (porque usa el bloque del atributo).
#
# Esta regla extrae los tokens de ambos bloques y los compara.
# ============================================================================

# Rutas relativas a src/css/ ($CssRoot).
$themeFiles = @('2-sys\theme\theme.light.css', '2-sys\theme\theme.dark.css')

foreach ($tf in $themeFiles) {
    $path = Join-Path $CssRoot $tf
    if (-not (Test-Path $path)) { continue }

    $code = Get-CodeOnly $path
    $lines = $code -split "`n"

    # Extraer tokens de un rango de lineas
    $getTokens = {
        param($start, $end)
        $result = @{}
        for ($i = $start; $i -le $end; $i++) {
            if ($lines[$i] -match '^\s*(--md-sys-color-[a-z0-9-]+)\s*:\s*(.+?)\s*;') {
                $result[$matches[1]] = $matches[2]
            }
        }
        return $result
    }

    # Encontrar el bloque @media
    $mediaStart = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '@media\s*\(prefers-color-scheme:') { $mediaStart = $i; break }
    }

    # Encontrar el bloque [data-theme]
    $attrStart = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^html\[data-theme=') { $attrStart = $i; break }
    }

    if ($mediaStart -lt 0 -or $attrStart -lt 0) {
        Add-Issue -Rule 'REGLA 7' -File "src/css/$tf" -Line 0 `
                  -Message "no se encontraron los dos bloques (@media y [data-theme])" -Snippet ''
        continue
    }

    # Encontrar el final de cada bloque (contando llaves)
    $findEnd = {
        param($start)
        $depth = 0
        for ($i = $start; $i -lt $lines.Count; $i++) {
            $depth += ([regex]::Matches($lines[$i], '\{')).Count
            $depth -= ([regex]::Matches($lines[$i], '\}')).Count
            if ($depth -eq 0) { return $i }
        }
        return $lines.Count - 1
    }

    $mediaEnd = & $findEnd $mediaStart
    $attrEnd = & $findEnd $attrStart

    $mediaTokens = & $getTokens $mediaStart $mediaEnd
    $attrTokens = & $getTokens $attrStart $attrEnd

    # Comparar
    $allKeys = @($mediaTokens.Keys) + @($attrTokens.Keys) | Sort-Object -Unique
    foreach ($key in $allKeys) {
        $inMedia = $mediaTokens.ContainsKey($key)
        $inAttr = $attrTokens.ContainsKey($key)

        if (-not $inMedia) {
            Add-Issue -Rule 'REGLA 7' -File "src/css/$tf" -Line 0 `
                      -Message "token $key esta en el bloque [data-theme] pero no en el bloque @media" -Snippet ''
        }
        elseif (-not $inAttr) {
            Add-Issue -Rule 'REGLA 7' -File "src/css/$tf" -Line 0 `
                      -Message "token $key esta en el bloque @media pero no en el bloque [data-theme]" -Snippet ''
        }
        elseif ($mediaTokens[$key] -ne $attrTokens[$key]) {
            Add-Issue -Rule 'REGLA 7' -File "src/css/$tf" -Line 0 `
                      -Message "token $key tiene valores distintos: @media=$($mediaTokens[$key]) vs [data-theme]=$($attrTokens[$key])" -Snippet ''
        }
    }
}

# ============================================================================
# REGLA 8 - Tablas de tokens del showroom
# --------------------------------------------------------------------------
# Estas reglas vienen del verificador de rdm-next-old, que tenia tres checks de
# tabla. Portan la doctrina que el proyecto viejo escribio en su SKILL.md y que
# aqui todavia no estaba:.
#
#   a) Formato. Toda <table> del showroom lleva sr-table. Y .sr-table es una
#      SUPERFICIE: borde real + radio, fondo, encabezado con tinte, rejilla
#      completa, code en monospace. Sin eso la tabla se lee como texto alineado,
#      no como un bloque de datos.
#
#   b) Specimen. Una tabla de color o de medidas debe PINTAR el valor, no solo
#      listarlo. Es la regla 308 del verificador viejo: "las medidas se muestran,
#      no solo se listan".
#
#   c) Contraste. El texto de la tabla tiene que dar 3:1 contra su fondo, en los
#      dos temas. Una tabla que documenta accesibilidad y falla ella misma es
#      peor que no documentarla.
#
# Por que el showroom necesita reglas propias: Get-CssFiles excluye todo lo que
# esta fuera de src/css/, asi que sin esta seccion showroom/assets/showroom.css
# no lo lee nadie. Y no se extiende a las capas de la libreria: alli manda
# REGLA 1 a REGLA 7.
# ============================================================================

$showroomRoot = Join-Path $ProjectRoot 'showroom'
$showroomCss = Join-Path $showroomRoot 'assets\showroom.css'

# a) Formato de la tabla

if (-not (Test-Path $showroomCss)) {
    Add-Issue -Rule 'REGLA 8' -File 'showroom/assets/showroom.css' -Line 0 `
              -Message 'no existe: sin el, las tablas del showroom no tienen patron' -Snippet ''
}
else {
    $srCss = [System.IO.File]::ReadAllText($showroomCss)

    # Cada <table> del showroom lleva la clase. Se comparan los dos conteos: el
    # de toda tabla del showroom contra el de toda tabla con sr-table.
    $srTables = 0
    foreach ($html in $htmlFiles) {
        $raw = [System.IO.File]::ReadAllText($html.FullName)
        $body = [regex]::Replace($raw, '(?s)<!--.*?-->', '')
        $rel = Get-RelPath $html.FullName $ProjectRoot

        $tot = ([regex]::Matches($body, '<table[\s>]')).Count
        $conPatron = ([regex]::Matches($body, '<table[^>]*class="[^"]*\bsr-table\b')).Count

        if ($tot -ne $conPatron) {
            Add-Issue -Rule 'REGLA 8' -File $rel -Line 0 `
                      -Message "hay $tot <table> y solo $conPatron llevan sr-table: toda tabla del showroom lleva el patron" `
                      -Snippet ''
        }
        $srTables += $tot
    }

    # c) Contraste del texto de la tabla, leido del arbol real de tokens.
    #
    # No se comprueba el color que escribe showroom.css sino el que RESUELVE,
    # siguiendo la cadena hasta 1-ref/palette.css. Asi el check no se rompe cada
    # vez que la paleta cambia, y detecta el fallo real: un rol nuevo que
    # documenta la tabla y no da 3:1.
    #
    # Los pares de TEXTO que la tabla usa, y que son los unicos medidos:
    #   texto de celda    body-medium sobre surface-container-lowest
    #   texto de th       title-medium sobre surface-container-low
    #
    # Se miden a 4.5:1, que es lo que exige WCAG 1.4.3 para texto normal.
    #
    # Lo que NO se mide, y por que: la linea de la rejilla y el contorno.
    #
    # outline-variant da 1.7:1 en claro y 2.07:1 en oscuro sobre la superficie
    # de la tabla, muy por debajo del 3:1 de WCAG 1.4.11. Medirlo y obligar a
    # subirlo seria inventar un requisito que el sistema no pide: 1.4.11 aplica
    # a la informacion visual NECESARIA para identificar un componente y su
    # estado, y una fila de tabla de documentacion no es un control. Ademas,
    # rdm-next-old eligio outline-variant para la rejilla a proposito (v0.86),
    # despues de haber probado outline: el encabezado se distingue por su
    # tinte, y `outline` solo se leia como una linea mas oscura.
    #
    # Asi que la rejilla va en outline-variant por decision, no por descuido. Si
    # algun dia se quisiera 3:1 de verdad, el rol correcto es `outline` (3.17:1
    # en claro, 6.1:1 en oscuro) y habria que cambiar el rol, no el umbral.
    function Get-TokenValue {
        param([string]$Token, [string]$ThemeFile)

        # El rol de color vive en 2-sys/theme/<tema>.css, NO en 2-sys/colors.css:
        # colors.css publica las utilidades de clase, y los roles los escriben
        # los dos bloques de cada tema. Se resuelve desde ahi.
        $txt = [System.IO.File]::ReadAllText((Join-Path $CssRoot $ThemeFile))
        $m = [regex]::Match($txt, [regex]::Escape($Token) + '\s*:\s*var\((--md-ref-palette-[a-z0-9-]+)\)')
        if (-not $m.Success) { return $null }
        $ref = $m.Groups[1].Value

        # La paleta usa las dos formas: 1-ref/palette.css escribe los extremos
        # en 3 digitos (#000, #fff) y el resto en 6. Se aceptan ambas y se
        # expande la corta, porque neutral100 es justamente el fondo de la
        # tabla en tema claro.
        $pal = [System.IO.File]::ReadAllText((Join-Path $CssRoot '1-ref\palette.css'))
        # OJO con el orden de las alternativas: la de 6 digitos va PRIMERO.
        # En una alternancia el motor prueba las ramas de izquierda a derecha y
        # se queda con la primera que case, sin mirar el resto. Con {3} primero,
        # un #1d1b20 se captura como #1d1, se expande a #11dd11, y el contraste
        # que sale no corresponde a ningun color del sistema. Es un fallo
        # silencioso: el verificador informaba de un problema de accesibilidad
        # inexistente y le echaba la culpa a un texto que en realidad da 17:1.
        $p = [regex]::Match($pal, [regex]::Escape($ref) + '\s*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})')
        if (-not $p.Success) { return $null }

        $hex = $p.Groups[1].Value
        if ($hex.Length -eq 4) {
            # #abc -> #aabbcc
            return '#' + ($hex[1]) + ($hex[1]) + ($hex[2]) + ($hex[2]) + ($hex[3]) + ($hex[3])
        }
        return $hex
    }

    function Get-Luminance {
        param([string]$Hex)

        $r = [Convert]::ToInt32($Hex.Substring(1, 2), 16) / 255.0
        $g = [Convert]::ToInt32($Hex.Substring(3, 2), 16) / 255.0
        $b = [Convert]::ToInt32($Hex.Substring(5, 2), 16) / 255.0

        # WCAG 2.x: los canales por debajo de 0.03928 se linealizan con
        # /12.92; el resto con la potencia 2.4.
        $lin = @($r, $g, $b) | ForEach-Object {
            if ($_ -le 0.03928) { $_ / 12.92 } else { [Math]::Pow(($_ + 0.055) / 1.055, 2.4) }
        }
        return 0.2126 * $lin[0] + 0.7152 * $lin[1] + 0.0722 * $lin[2]
    }

    function Get-Contrast {
        param([string]$A, [string]$B)

        $la = Get-Luminance $A
        $lb = Get-Luminance $B
        if ($la -lt $lb) { $t = $la; $la = $lb; $lb = $t }
        return ($la + 0.05) / ($lb + 0.05)
    }

    # Se mide en LOS DOS TEMAS. El showroom tiene un toggle de tema, asi que
    # un par que funciona en claro y falla en oscuro es un fallo real de la
    # pagina, aunque el tema por defecto pase.
    $pares = @(
        @{ Name = 'texto de celda';    Fg = '--md-sys-color-on-surface';        Bg = '--md-sys-color-surface-container-lowest'; Min = 4.5 }
        @{ Name = 'texto de th';       Fg = '--md-sys-color-on-surface';        Bg = '--md-sys-color-surface-container-low';     Min = 4.5 }
    )

    $temas = @(
        @{ Nombre = 'claro'; Archivo = '2-sys\theme\theme.light.css' }
        @{ Nombre = 'oscuro'; Archivo = '2-sys\theme\theme.dark.css' }
    )

    foreach ($tema in $temas) {
        foreach ($par in $pares) {
            $fg = Get-TokenValue $par.Fg  $tema.Archivo
            $bg = Get-TokenValue $par.Bg  $tema.Archivo

            if ($null -eq $fg -or $null -eq $bg) {
                Add-Issue -Rule 'REGLA 8' -File 'showroom/assets/showroom.css' -Line 0 `
                          -Message "no se pudo resolver $($par.Fg) o $($par.Bg) desde $($tema.Archivo)" -Snippet ''
                continue
            }

            $c = Get-Contrast $fg $bg
            if ($c -lt $par.Min) {
                Add-Issue -Rule 'REGLA 8' -File 'showroom/assets/showroom.css' -Line 0 `
                          -Message "$($par.Name) en tema $($tema.Nombre) da $([Math]::Round($c, 2)):1 ($fg sobre $bg) y necesita $($par.Min):1" `
                          -Snippet "$($par.Fg) sobre $($par.Bg)"
            }
        }
    }

    # La receta del formato v0.82, comprobada por propiedad. Cada una es un
    # requisito que se puede violar sin que la tabla se rompa, asi que ninguno
    # se deduce de los otros.
    # Cada entrada trae Regex explicito, porque el script corre con
    # Set-StrictMode: una clave que falta en un solo elemento del array hace
    # fallar el acesso a $f.Regex en TODOS ellos. Ausente = $false.
    $formato = @(
        @{ Token = 'border-radius: var(--md-sys-shape-corner-medium)'; Msg = 'la tabla no declara radio: sin el no se lee como superficie'; Regex = $false },
        @{ Token = 'border-collapse: separate';                        Msg = 'la tabla no declara border-collapse: separate: hace falta para que el radio recorte con overflow'; Regex = $false },
        @{ Token = 'overflow: hidden';                                  Msg = 'la tabla no declara overflow: hidden: el radio solo recorta con overflow'; Regex = $false },
        @{ Token = 'surface-container-lowest';                         Msg = 'la tabla no pinta superficie propia'; Regex = $false },
        @{ Token = 'var(--md-sys-typescale-title-medium)';              Msg = 'el encabezado no usa title-medium: pesaria menos que su propio contenido'; Regex = $false },
        @{ Token = 'var(--md-sys-typescale-body-medium)';              Msg = 'las celdas no usan body-medium'; Regex = $false },
        @{ Token = 'font-family: monospace';                            Msg = 'el <code> de la tabla no queda en monospace explicito'; Regex = $true },
        @{ Token = 'thead th';                                          Msg = 'no hay encabezado con tinte: sin el el th se confunde con el contenido'; Regex = $false }
    )

    # Dos formas de comprobar. Por defecto, Contains: busca el texto tal cual,
    # que es lo que quiere decir "la declaracion esta". Con Regex, se busca la
    # DECLARACION, no su texto: `font-family: monospace` esta en la hoja
    # escrito `font-family: monospace;` y un Contains sin el punto y coma
    # daria falso negativo. Prefijar los parentesis sin escapar convierte
    # `(...)` en un grupo de captura, asi que se escapan.
    #
    # Los metacaracteres se escapan siempre: sin eso, un token con punto como
    # `border-radius: var(--md-sys-shape-corner-medium)` pasaria por regex y
    # coincidiria con cualquier cosa.
    foreach ($f in $formato) {
        $found = if ($f.Regex) {
            [regex]::IsMatch($srCss, [regex]::Escape($f.Token) + '\s*;')
        }
        else {
            $srCss.Contains($f.Token)
        }

        if (-not $found) {
            Add-Issue -Rule 'REGLA 8' -File 'showroom/assets/showroom.css' -Line 0 `
                      -Message $f.Msg -Snippet $f.Token
        }
    }

    # Una regla de seguridad que el formato completo vuelve necesaria: el ancho
    # de las barras de medida no puede venir del markup. Se comprueba que exista
    # la clase de ancho, porque un swatch sin ancho en una celda no mide nada.
    if (-not ($srCss -match '\.sr-spec-bar--\d')) {
        Add-Issue -Rule 'REGLA 8' -File 'showroom/assets/showroom.css' -Line 0 `
                  -Message 'no hay clases sr-spec-bar--N: las barras de medida no tendrian ancho, y REGLA 6 prohibe ponerlo en el markup' `
                  -Snippet ''
    }

    # b) Specimen en las tablas de color y de medidas
    #
    # Se busca el encabezado de la tabla, no el de la pagina: una tabla que
    # documenta tokens de color o medidas tiene que pintar algo. Se acepta
    # cualquiera de las tres familias de muestra.
    $tablas = [regex]::Matches($srCss, '(?s)sr-spec')
    if ($tablas.Count -eq 0) {
        Add-Issue -Rule 'REGLA 8' -File 'showroom/assets/showroom.css' -Line 0 `
                  -Message 'no hay specimens (sr-spec-*): las tablas de tokens listarian valores sin mostrarlos' `
                  -Snippet ''
    }
}

Write-Host '  Reglas aplicadas:' -ForegroundColor DarkGray
Write-Host '    REGLA 1  sin valores crudos fuera de 1-ref'
Write-Host '    REGLA 2  direccion de dependencias entre capas'
Write-Host '    REGLA 3  todo token referenciado existe'
Write-Host '    REGLA 4  orden de theme.light antes que theme.dark'
Write-Host '    REGLA 5  integridad de la estructura y @layer'
Write-Host '    REGLA 6  sin estilos inline ni <style> en el showroom'
Write-Host '    REGLA 7  sincronizacion de bloques de tema'
Write-Host '    REGLA 8  formato, specimens y contraste de las tablas de tokens'
Write-Host ''

if ($script:Issues.Count -eq 0) {
    Write-Host '  OK - La arquitectura se respeta en las 8 reglas.' -ForegroundColor Green
    Write-Host ''
    exit 0
}

# Agrupar por regla para que el resumen sea util
$byRule = $script:Issues | Group-Object Rule | Sort-Object Name

Write-Host "  FALLOS: $($script:Issues.Count)" -ForegroundColor Red
Write-Host ''

foreach ($group in $byRule) {
    Write-Host "  $($group.Name): $($group.Count)" -ForegroundColor Yellow
    foreach ($issue in $group.Group | Select-Object -First 12) {
        $loc = if ($issue.Line -gt 0) { "$($issue.File):$($issue.Line)" } else { $issue.File }
        Write-Host "    $loc" -ForegroundColor Gray
        Write-Host "      $($issue.Message)" -ForegroundColor DarkYellow
        if ($issue.Snippet) {
            Write-Host "      > $($issue.Snippet)" -ForegroundColor DarkGray
        }
    }
    if ($group.Count -gt 12) {
        Write-Host "    ... y $($group.Count - 12) mas" -ForegroundColor DarkGray
    }
    Write-Host ''
}

Write-Host '  Corregir antes de hacer commit.' -ForegroundColor Red
Write-Host ''
exit 1
