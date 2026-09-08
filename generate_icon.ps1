Add-Type -AssemblyName System.Drawing

function Create-DigiWarriorsIcon {
    param([string]$outputPath)

    [int[]]$sizes = @(256, 128, 64, 48, 32, 16)
    $bitmaps = @()

    foreach ($s in $sizes) {
        $bmp = New-Object System.Drawing.Bitmap($s, $s, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.Clear([System.Drawing.Color]::Transparent)

        $w = [int]$s
        $h = [int]$s
        $rx = [int]($w * 0.22)
        
        $rect = New-Object System.Drawing.Rectangle(2, 2, ($w - 4), ($h - 4))
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddArc($rect.X, $rect.Y, $rx, $rx, 180, 90)
        $path.AddArc(($rect.Right - $rx), $rect.Y, $rx, $rx, 270, 90)
        $path.AddArc(($rect.Right - $rx), ($rect.Bottom - $rx), $rx, $rx, 0, 90)
        $path.AddArc($rect.X, ($rect.Bottom - $rx), $rx, $rx, 90, 90)
        $path.CloseFigure()

        # Gradient Brush (Deep Navy Blue to Vibrant Indigo)
        $linBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            (New-Object System.Drawing.PointF(0, 0)),
            (New-Object System.Drawing.PointF($w, $h)),
            [System.Drawing.Color]::FromArgb(255, 15, 23, 42),
            [System.Drawing.Color]::FromArgb(255, 30, 58, 138)
        )
        $g.FillPath($linBrush, $path)

        # Border
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 59, 130, 246), [float]([Math]::Max(1.0, $w * 0.04)))
        $g.DrawPath($pen, $path)

        # Inner DW Monogram
        $fontSize = [float]($w * 0.40)
        $font = New-Object System.Drawing.Font("Segoe UI Black", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
        $text = "DW"
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

        # Shadow text
        $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 2, 6, 23))
        $textRectShadow = New-Object System.Drawing.RectangleF(0, [float]($w * 0.04), [float]$w, [float]$h)
        $g.DrawString($text, $font, $shadowBrush, $textRectShadow, $sf)

        # Gradient text brush (Cyan to Amber Gold)
        $textBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            (New-Object System.Drawing.PointF(0, 0)),
            (New-Object System.Drawing.PointF($w, $h)),
            [System.Drawing.Color]::FromArgb(255, 56, 189, 248),
            [System.Drawing.Color]::FromArgb(255, 251, 191, 36)
        )
        $textRect = New-Object System.Drawing.RectangleF(0, 0, [float]$w, [float]$h)
        $g.DrawString($text, $font, $textBrush, $textRect, $sf)

        # Small bottom bar highlight
        $barBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
        $barY = [float]($h * 0.82)
        $barH = [float]([Math]::Max(2.0, $h * 0.04))
        $barW = [float]($w * 0.44)
        $barX = [float]($w * 0.28)
        $g.FillRectangle($barBrush, $barX, $barY, $barW, $barH)

        $g.Dispose()
        $bitmaps += $bmp
    }

    # Write multi-resolution ICO file
    $fs = [System.IO.File]::Create($outputPath)
    $bw = New-Object System.IO.BinaryWriter($fs)

    $bw.Write([uint16]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]$bitmaps.Count)

    $pngStreams = @()
    foreach ($bmp in $bitmaps) {
        $ms = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngStreams += $ms
    }

    $offset = 6 + (16 * $bitmaps.Count)
    for ($i = 0; $i -lt $bitmaps.Count; $i++) {
        $bmp = $bitmaps[$i]
        $pngMs = $pngStreams[$i]
        $bytes = $pngMs.ToArray()

        $w = if ($bmp.Width -ge 256) { 0 } else { [byte]$bmp.Width }
        $h = if ($bmp.Height -ge 256) { 0 } else { [byte]$bmp.Height }

        $bw.Write([byte]$w)
        $bw.Write([byte]$h)
        $bw.Write([byte]0)
        $bw.Write([byte]0)
        $bw.Write([uint16]1)
        $bw.Write([uint16]32)
        $bw.Write([uint32]$bytes.Length)
        $bw.Write([uint32]$offset)
        $offset += $bytes.Length
    }

    for ($i = 0; $i -lt $pngStreams.Count; $i++) {
        $bytes = $pngStreams[$i].ToArray()
        $bw.Write($bytes)
        $pngStreams[$i].Dispose()
        $bitmaps[$i].Dispose()
    }

    $bw.Flush()
    $bw.Close()
    $fs.Close()
    Write-Host "Successfully generated icon: $outputPath"
}

Create-DigiWarriorsIcon -outputPath "k:\00_Tools\05_DW\app.ico"
