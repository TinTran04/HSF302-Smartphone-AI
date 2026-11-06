#Requires -Version 7.0
param(
    [ValidateRange(1, 30)][int]$MaxPerBrand = 12,
    [ValidateRange(2010, 2026)][int]$MinimumYear = 2024,
    [ValidateRange(1, 1000)][decimal]$BdtToVnd = 200
)
$ErrorActionPreference = 'Stop'
$imageManifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'images.json') -Raw | ConvertFrom-Json
$images = @{}
foreach ($image in $imageManifest.images) {
    if ($images.ContainsKey($image.sourceUrl)) { throw "Duplicate image source URL: $($image.sourceUrl)" }
    if ($image.localPath -notmatch '^/images/phones/[a-z0-9-]+\.(webp|png|jpg)$') { throw 'Invalid local image path.' }
    $assetPath = Join-Path $PSScriptRoot ("../../FE/public" + $image.localPath)
    if (!(Test-Path -LiteralPath $assetPath) -or
        (Get-FileHash -LiteralPath $assetPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $image.sha256) {
        throw "Missing or changed image asset: $($image.localPath)"
    }
    $images[$image.sourceUrl] = $image
}
$brandNames = @{
    Apple='Apple'; Samsung='Samsung'; Xiaomi='Xiaomi'; Oppo='OPPO'; Vivo='vivo'
    Realme='realme'; OnePlus='OnePlus'; Google='Google'; Nothing='Nothing'
    Asus='ASUS'; Honor='HONOR'; Motorola='Motorola'; Sony='Sony'; Nokia='Nokia'
}
$counts = @{}
$seen = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
$phones = [System.Collections.Generic.List[object]]::new()

function Limit-Text([string]$Value) {
    $text = ($Value -replace '\s+', ' ').Trim()
    if ($text.Length -gt 255) { return $text.Substring(0, 252) + '...' }
    return $text
}

Import-Csv -LiteralPath (Join-Path $PSScriptRoot 'raw.csv') | ForEach-Object {
    $row = $_
    $brand = $brandNames[$row.General_Brand]
    $year = [regex]::Match($row.Released, '\b(20\d{2})\b')
    $pairs = [regex]::Matches($row.Memory_Variant, '(?i)(\d+)\s*GB\s+(\d+)\s*(GB|TB)')
    $prices = [regex]::Matches($row.Price, '৳\s*([\d,]+)')
    if (!$brand -or $row.General_Device -ne 'Smartphones' -or !$year.Success -or
        [int]$year.Value -lt $MinimumYear -or [int]$year.Value -gt 2026 -or
        $row.Launch_Status -notmatch '^Available' -or $pairs.Count -eq 0 -or $prices.Count -eq 0 -or
        !$row.Platform_Chipset -or !$row.Battery_Capacity -or !$row.Display_Size -or !$row.More_Color -or
        $row.URL -notmatch '^https://www\.mobiledokan\.co/product/[^\s]+$' -or
        $counts[$brand] -ge $MaxPerBrand -or $seen.Contains($row.URL)) { return }

    $priceBdt = [long]$prices[-1].Groups[1].Value.Replace(',', '')
    $priceVnd = [long]([math]::Round($priceBdt * $BdtToVnd / 10000, 0, [MidpointRounding]::AwayFromZero) * 10000)
    if ($priceBdt -le 0 -or $priceVnd -le 0 -or $priceVnd -gt 100000000) { return }
    $basePair = $pairs[0]
    $ram = [int]$basePair.Groups[1].Value
    $storage = $basePair.Groups[2].Value + $basePair.Groups[3].Value.ToUpperInvariant()
    $name = ($row.Name -replace ('(?i)^' + [regex]::Escape($row.General_Brand) + '\s+'), '').Trim()
    $color = Limit-Text (($row.More_Color -split ',')[0])
    if (!$name -or $name.Length -gt 255 -or $ram -le 0 -or !$color) { return }

    $cameraFields = @('Main camera_Single','Main camera_Dual','Main camera_Triple','Main camera_Quad','Main camera_Penta','Camera_Primary','Camera')
    $rearCamera = $cameraFields | ForEach-Object { $row.$_ } | Where-Object { $_ } | Select-Object -First 1
    $specifications = [ordered]@{
        'Chip xử lý' = Limit-Text $row.Platform_Chipset
        'RAM' = "$ram GB"
        'Màn hình' = Limit-Text ($row.Display_Size + ' · ' + $row.Display_Type)
        'Pin' = Limit-Text $row.Battery_Capacity
        'Bộ nhớ' = $storage
        'Ngày phát hành' = Limit-Text $row.Released
        'Nguồn dữ liệu' = 'UTSHO DEY / Kaggle, Global Mobile Phone Specifications & Prices, v1'
        'URL nguồn' = $row.URL
        'Giá gốc (BDT)' = $priceBdt.ToString([cultureinfo]::InvariantCulture)
        'Giá nguồn hiển thị' = Limit-Text $row.Price
        'Ghi chú giá' = "Giá VNĐ minh họa để test, hệ số $BdtToVnd VNĐ/BDT."
    }
    if ($rearCamera) { $specifications['Camera'] = Limit-Text $rearCamera }
    if ($row.Platform_OS) { $specifications['Hệ điều hành'] = Limit-Text $row.Platform_OS }
    if ($row.Battery_Charging) { $specifications['Sạc'] = Limit-Text $row.Battery_Charging }
    if ($row.Display_Resolution) { $specifications['Độ phân giải'] = Limit-Text $row.Display_Resolution }
    $imagePath = '/images/placeholder.svg'
    if ($images.ContainsKey($row.URL)) {
        if ($images[$row.URL].sourceName -ne $row.Name) { throw "Image model mismatch: $($row.Name)" }
        $imagePath = $images[$row.URL].localPath
    }
    $phones.Add([ordered]@{
        name=$name; sourceName=$row.Name; brand=$brand; sourceUrl=$row.URL
        description="Dữ liệu tham khảo từ bộ Global Mobile Phone Specifications & Prices của UTSHO DEY trên Kaggle. Giá bán hiển thị là giá minh họa quy đổi từ BDT để kiểm thử dự án, hệ số $BdtToVnd VNĐ/BDT. Thông số và phiên bản theo dữ liệu nguồn. Nguồn chi tiết được ghi trong phần thông số."
        sourcePriceBdt=$priceBdt; price=$priceVnd; color=$color; storage=$storage
        image=$imagePath; specifications=$specifications
    })
    $null = $seen.Add($row.URL)
    $counts[$brand] = 1 + [int]$counts[$brand]
}

$source = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'source.json') -Raw | ConvertFrom-Json
$products = @($phones | Sort-Object brand, name)
$catalog = [ordered]@{
    source=[ordered]@{url=$source.url; version=$source.version; license=$source.license; currency='BDT'}
    conversion=[ordered]@{illustrative=$true; bdtToVnd=$BdtToVnd; targetCurrency='VND'; rounding=10000}
    selection=[ordered]@{minimumYear=$MinimumYear; maximumYear=2026; maxPerBrand=$MaxPerBrand}
    products=$products
}
$json = $catalog | ConvertTo-Json -Depth 8
[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'catalog.json'), $json + "`n", [Text.UTF8Encoding]::new($false))
$rowsJson = ConvertTo-Json -InputObject $products -Depth 8 -Compress
if ($rowsJson.Contains('$phone_dataset$')) { throw 'Dataset conflicts with the SQL literal delimiter.' }
$sql = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'import.template.sql') -Raw
$sql = $sql.Replace('@@CATALOG_JSON@@', $rowsJson)
$backfillSql = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'backfill-images.template.sql') -Raw
$sql = $sql.Replace('@@IMAGE_BACKFILL_SQL@@', $backfillSql.TrimEnd())
[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'import.sql'), $sql, [Text.UTF8Encoding]::new($false))
[pscustomobject]@{selectedProducts=$products.Count;brands=$counts.Count;priceVndIsIllustrative=$true;bdtToVnd=$BdtToVnd} | ConvertTo-Json -Compress
