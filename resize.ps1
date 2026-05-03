param(
  [string]$sourcePath,
  [string]$destPath,
  [int]$width,
  [int]$height
)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($sourcePath)
$bmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $width, $height)
$bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$img.Dispose()
