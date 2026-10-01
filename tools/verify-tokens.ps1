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

# Nombres de archivo que no se escanean por ser marcadores de directorio vacio.
$Markers = @('.gitkeep')

# ============================================================================
# UTILIDADES
# ============================================================================

# Devuelve las hojas CSS del proyecto en orden alfabetico, relative al proyecto.
function Get-CssFiles {
    param([string]$Root)

    $extensions = '*.css', '*.scss'
    $excludeDirs = @('3-comp')   # los componentes se validan al agregarse

    Get-ChildItem -Path $Root -Recurse -File -Include $extensions |
        Where-Object {
            $name = $_.Name
            $rel = $_.FullName.Substring($Root.Length + 1)

            # fuera de marcadores
            $name -notin $Markers -and
            # fuera de main.css (se valida aparte, con reglas propias)
            $name -ne 'main.css' -and
            # dentro de las carpetas de capas, mas el reset de la raiz de css/
            # (el reset no va en una carpeta numerada: no es un token de M3,
            #  es un reinicio del navegador. Ver la cabecera de css/reset.css)
            ($rel -match '1-ref|2-sys|3-comp' -or $rel -eq 'css\reset.css')
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

# Devuelve la capa de una hoja a partir de su ruta relativa.
function Get-Layer {
    param([string]$Relative)

    if ($Relative -eq 'css\reset.css') { return 'reset' }
    if ($Relative -match '1-ref') { return 'ref' }
    if ($Relative -match '2-sys') { return 'sys' }
    if ($Relative -match '3-comp') { return 'comp' }
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

$files = Get-CssFiles -Root $ProjectRoot

# Anotar cada archivo con su ruta relativa al proyecto. Se usa en las reglas
# 1 y 2 para determinar la capa y para reportar la ubicacion del fallo.
foreach ($file in $files) {
    $relPath = $file.FullName.Substring($ProjectRoot.Length + 1)
    Add-Member -InputObject $file -NotePropertyName Relative -NotePropertyValue $relPath
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
    $layer = Get-Layer $file.Relative
    if ($layer -eq 'ref') { continue }

    $code = Get-CodeOnly $file.FullName
    $lines = $code -split "`n"
    $rel = $file.FullName.Substring($ProjectRoot.Length + 1)

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
    $layer = Get-Layer $file.Relative
    $code = Get-CodeOnly $file.FullName
    $lines = $code -split "`n"
    $rel = $file.FullName.Substring($ProjectRoot.Length + 1)

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
    $rel = $file.FullName.Substring($ProjectRoot.Length + 1)

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

$mainPath = Join-Path $ProjectRoot 'css\main.css'

if (-not (Test-Path $mainPath)) {
    Add-Issue -Rule 'REGLA 5' -File 'css/main.css' -Line 0 -Message 'no existe' -Snippet ''
}
else {
    $mainCode = Get-CodeOnly $mainPath
    $imports = [regex]::Matches($mainCode, '@import url\("([^"]+)"\)\s*layer\((\w+)\)')

    $seq = @($imports | ForEach-Object { $_.Groups[1].Value })
    $iLight = [array]::IndexOf($seq, '2-sys/theme/theme.light.css')
    $iDark  = [array]::IndexOf($seq, '2-sys/theme/theme.dark.css')

    if ($iLight -lt 0) {
        Add-Issue -Rule 'REGLA 4' -File 'css/main.css' -Line 0 -Message 'no importa 2-sys/theme/theme.light.css' -Snippet ''
    }
    elseif ($iDark -lt 0) {
        Add-Issue -Rule 'REGLA 4' -File 'css/main.css' -Line 0 -Message 'no importa 2-sys/theme/theme.dark.css' -Snippet ''
    }
    elseif ($iLight -gt $iDark) {
        Add-Issue -Rule 'REGLA 4' -File 'css/main.css' -Line 0 `
                  -Message 'orden invertido: theme.light.css debe importarse ANTES que theme.dark.css, o el sistema arranca en oscuro para todos' `
                  -Snippet ''
    }

    # Cada archivo importado debe existir en disco.
    # Las rutas de los @import de main.css son RELATIVAS a css/ (donde vive
    # main.css), no a la raiz del proyecto. Por eso se resuelve partiendo de
    # la carpeta css/.
    $cssRoot = Join-Path $ProjectRoot 'css'
    foreach ($imp in $imports) {
        $p = Join-Path $cssRoot ($imp.Groups[1].Value -replace '/', '\')
        if (-not (Test-Path $p)) {
            Add-Issue -Rule 'REGLA 5' -File 'css/main.css' -Line 0 `
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
$mainRaw = Get-CodeOnly $mainPath
$layerDecl = [regex]::Match($mainRaw, '@layer\s+([^;]+);')
if (-not $layerDecl.Success) {
    Add-Issue -Rule 'REGLA 5' -File 'css/main.css' -Line 0 -Message 'no declara @layer' -Snippet ''
}
elseif ($layerDecl.Index -gt [regex]::Match($mainRaw, '@import').Index) {
    Add-Issue -Rule 'REGLA 5' -File 'css/main.css' -Line 0 `
              -Message '@layer debe declararse ANTES del primer @import' -Snippet ''
}
else {
    $declared = $layerDecl.Groups[1].Value
    foreach ($need in @('reset', 'ref', 'sys', 'comp', 'utilities')) {
        if ($declared -notmatch "\b$need\b") {
            Add-Issue -Rule 'REGLA 5' -File 'css/main.css' -Line 0 -Message "no declara la capa @$need" -Snippet ''
        }
    }

    # El ORDEN de la declaracion es la tabla de precedencia del sistema.
    # Si una capa se declara despues de otra, esa otra pierde contra ella.
    # Un orden alterado no rompe el build: rompe la ARQUITECTURA en silencio.
    $order = ($declared -split ',' | ForEach-Object { $_.Trim() }) |
             Where-Object { $_ -ne '' }
    $wanted = @('reset', 'ref', 'sys', 'comp', 'utilities')
    if (($order -join ',') -ne ($wanted -join ',')) {
        Add-Issue -Rule 'REGLA 5' -File 'css/main.css' -Line 0 `
                  -Message "orden de capas incorrecto. Esperado: $($wanted -join ', '). Encontrado: $($order -join ', ')" `
                  -Snippet ''
    }
}

# reset.css debe existir y ser el PRIMER import del orquestador.
$resetPath = Join-Path $ProjectRoot 'css\reset.css'
if (-not (Test-Path $resetPath)) {
    Add-Issue -Rule 'REGLA 5' -File 'css\reset.css' -Line 0 `
              -Message 'falta la capa 0: css/reset.css es el primer import del sistema' -Snippet ''
}
else {
    $firstImport = [regex]::Match($mainRaw, '@import\s+url\(\s*"([^"]+)"')
    if ($firstImport.Success -and $firstImport.Groups[1].Value -ne 'reset.css') {
        Add-Issue -Rule 'REGLA 5' -File 'css/main.css' -Line 0 `
                  -Message "reset.css debe ser el PRIMER import (se encontro '$($firstImport.Groups[1].Value)' primero). El reset necesita declararse antes que las capas que lo van a sobreescribir" `
                  -Snippet ''
    }
}

# Estructura de carpetas esperada
$expected = @(
    'css\1-ref', 'css\2-sys', 'css\2-sys\theme', 'css\3-comp', 'tools'
)
foreach ($dir in $expected) {
    if (-not (Test-Path (Join-Path $ProjectRoot $dir))) {
        Add-Issue -Rule 'REGLA 5' -File $dir -Line 0 -Message 'falta el directorio esperado' -Snippet ''
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
    $rel = $html.FullName.Substring($ProjectRoot.Length + 1)

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
# RESULTADO
# ============================================================================

Write-Host '  Reglas aplicadas:' -ForegroundColor DarkGray
Write-Host '    REGLA 1  sin valores crudos fuera de 1-ref'
Write-Host '    REGLA 2  direccion de dependencias entre capas'
Write-Host '    REGLA 3  todo token referenciado existe'
Write-Host '    REGLA 4  orden de theme.light antes que theme.dark'
Write-Host '    REGLA 5  integridad de la estructura y @layer'
Write-Host '    REGLA 6  sin estilos inline ni <style> en el showroom'
Write-Host ''

if ($script:Issues.Count -eq 0) {
    Write-Host '  OK - La arquitectura se respeta en las 6 reglas.' -ForegroundColor Green
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
