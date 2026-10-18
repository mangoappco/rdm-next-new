# Envoltura del verificador. La implementacion esta en tools/verify-tokens.mjs,
# que corre igual en Windows, macOS y Linux. Este archivo se conserva para que
# quien lo lanzaba por aqui siga lanzandolo por aqui, y ejecuta exactamente el
# mismo codigo: una sola implementacion, que es lo que evita que dos
# verificadores se separen en silencio.
#
# El .ps1 anterior era Windows-canon (Join-Path con '\', rutas relativas
# normalizadas a '\'), asi que en macOS no encontraba ni un archivo y
# reportaba un OK falso sobre una biblioteca que no habia leido.

node "$PSScriptRoot/verify-tokens.mjs"
exit $LASTEXITCODE
