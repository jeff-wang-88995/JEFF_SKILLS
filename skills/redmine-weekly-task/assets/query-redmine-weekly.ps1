$apiKey = "YOUR_API_KEY"
$startDate = "2026-04-13"
$endDate = "2026-04-17"
$weekCode = "115W16"
$baseUrl = "https://redmine.int.ennowell.net"

$headers = @{ "X-Redmine-API-Key" = $apiKey }

$url = "$baseUrl/issues.json?set_filter=1&sort=status%2Cid%3Adesc&f%5B%5D=status_id&op%5Bstatus_id%5D=%21&v%5Bstatus_id%5D%5B%5D=5&v%5Bstatus_id%5D%5B%5D=6&f%5B%5D=assigned_to_id&op%5Bassigned_to_id%5D=%3D&v%5Bassigned_to_id%5D%5B%5D=me&f%5B%5D=due_date&op%5Bdue_date%5D=%3E%3C&v%5Bdue_date%5D%5B%5D=$startDate&v%5Bdue_date%5D%5B%5D=$endDate&limit=100"

$response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
$issues = $response.issues

if (-not $issues -or $issues.Count -eq 0) {
	$fallbackUrl = "$baseUrl/issues.json?set_filter=1&sort=status%2Cid%3Adesc&f%5B%5D=status_id&op%5Bstatus_id%5D=%21&v%5Bstatus_id%5D%5B%5D=5&v%5Bstatus_id%5D%5B%5D=6&f%5B%5D=assigned_to_id&op%5Bassigned_to_id%5D=%3D&v%5Bassigned_to_id%5D%5B%5D=me&f%5B%5D=cf_29&op%5Bcf_29%5D=%3D&v%5Bcf_29%5D%5B%5D=$weekCode&limit=100"
	$response = Invoke-RestMethod -Uri $fallbackUrl -Headers $headers -Method Get
	$issues = $response.issues
}

$response.total_count
$issues | Select-Object id, subject, assigned_to, due_date