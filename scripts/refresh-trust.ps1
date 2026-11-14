# Refresh the committed public snapshot. Run from the repository root with:
# powershell -NoProfile -ExecutionPolicy Bypass -File scripts/refresh-trust.ps1
# No API keys or additional dependencies. A failed request leaves the snapshot intact.
param([string]$Through = (Get-Date).ToUniversalTime().AddDays(-1).ToString('yyyy-MM-dd'))

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root = Split-Path -Parent $PSScriptRoot
$packageSource = Get-Content -LiteralPath (Join-Path $root 'src/data/packages.ts') -Raw
$names = @([regex]::Matches($packageSource, "pk\('([^']+)'") | ForEach-Object { $_.Groups[1].Value })
if ($names.Count -eq 0 -or ($names | Select-Object -Unique).Count -ne $names.Count) {
    throw 'Expected unique package names in src/data/packages.ts.'
}

# cranlogs covers the Posit/RStudio mirror from October 2012, not every CRAN mirror.
$start = '2012-10-01'
$end = [DateTime]::ParseExact($Through, 'yyyy-MM-dd', [Globalization.CultureInfo]::InvariantCulture)
if ($end -lt [DateTime]$start -or $end -ge (Get-Date).ToUniversalTime().Date) {
    throw 'Through must be a completed UTC day within the cranlogs coverage period.'
}
$url = "https://cranlogs.r-pkg.org/downloads/total/${start}:${Through}/$($names -join ',')"
$rows = Invoke-RestMethod -Uri $url -TimeoutSec 45
if ($rows.Count -ne $names.Count) { throw 'Incomplete cranlogs response.' }
foreach ($name in $names) {
    $row = @($rows | Where-Object { $_.package -eq $name })
    if ($row.Count -ne 1 -or $row[0].start -ne $start -or $row[0].end -ne $Through -or
        $null -eq $row[0].downloads -or $row[0].downloads -lt 0 -or
        [double]$row[0].downloads -ne [Math]::Floor([double]$row[0].downloads)) {
        throw "Invalid cranlogs response for $name."
    }
}

$youtubeUrl = 'https://www.youtube.com/user/rsquaredin/about'
$html = (Invoke-WebRequest -UseBasicParsing -Uri $youtubeUrl -TimeoutSec 45 -Headers @{ 'Accept-Language' = 'en-US,en;q=0.9' }).Content
# YouTube sometimes wraps its initial JSON in a JavaScript string with hex escapes.
$decoded = [regex]::Replace($html, '\\x([0-9a-fA-F]{2})', {
    param($match) [char][Convert]::ToInt32($match.Groups[1].Value, 16)
}).Replace('\"', '"')
$channelId = 'UCVexlPS8V4Mldyakj5-le0g'
if ($decoded -notmatch ('"externalId":"' + $channelId + '"')) { throw 'Unexpected YouTube channel.' }
# Scope to this channel's About panel, excluding recommended channels' statistics.
$about = [regex]::Match($decoded, '"aboutChannelViewModel":\{(?<panel>[\s\S]*?)"videoCountText":"(?<count>[\d,]+) videos"')
if (-not $about.Success) { throw 'YouTube video count unavailable; keep the existing snapshot.' }
$subscribers = [regex]::Match($about.Groups['panel'].Value, '"subscriberCountText":"(?<label>[\d.,]+[kKmM]? subscribers)"')
$videoCount = [int]($about.Groups['count'].Value.Replace(',', ''))
if ($videoCount -le 0) { throw 'Invalid YouTube video count.' }

$retrievedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
$snapshot = [ordered]@{
    cran = [ordered]@{
        source = $url
        start = $start
        end = $Through
        retrievedAt = $retrievedAt
        total = [long](($rows | Measure-Object -Property downloads -Sum).Sum)
        packages = @($rows | Select-Object package, downloads)
    }
    youtube = [ordered]@{
        source = $youtubeUrl
        channelId = $channelId
        retrievedAt = $retrievedAt
        videoCount = $videoCount
        # Preserve YouTube's rounded display label; never turn it into an exact count.
        subscriberLabel = $(if ($subscribers.Success) { $subscribers.Groups['label'].Value } else { $null })
    }
}
$destination = Join-Path $root 'src/data/trust-signals.json'
$json = ($snapshot | ConvertTo-Json -Depth 6) + "`n"
[IO.File]::WriteAllText($destination, $json, (New-Object Text.UTF8Encoding($false)))
Write-Output "Saved $($snapshot.cran.total) CRAN downloads through $Through; $videoCount YouTube videos."
