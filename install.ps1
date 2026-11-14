<#
  Cài skill interactive-3d-presentation cho các AI agent (Windows PowerShell 5.1+ / PowerShell 7).

    .\install.ps1                          # cài toàn cục cho Claude Code, Codex, Antigravity
    .\install.ps1 -Agent claude            # chỉ một agent: claude | codex | antigravity | all
    .\install.ps1 -Project C:\code\my-deck # cài vào một dự án thay vì toàn cục

  Nếu PowerShell chặn script: powershell -ExecutionPolicy Bypass -File .\install.ps1
#>
param(
  [ValidateSet('all', 'claude', 'codex', 'antigravity')]
  [string]$Agent = 'all',
  [string]$Project = ''
)
$ErrorActionPreference = 'Stop'
$Name = 'interactive-3d-presentation'
$Src = Join-Path $PSScriptRoot "skills\$Name"
if (-not (Test-Path (Join-Path $Src 'SKILL.md'))) { throw "Không thấy $Src\SKILL.md — chạy script trong thư mục repo." }

$targets = New-Object System.Collections.Generic.List[string]
function Add-Target([string]$p) { if (-not $targets.Contains($p)) { $targets.Add($p) } }
if ($Project) {
  if ($Agent -in 'all', 'claude') { Add-Target (Join-Path $Project '.claude\skills') }
  if ($Agent -in 'all', 'codex', 'antigravity') { Add-Target (Join-Path $Project '.agents\skills') }
} else {
  if ($Agent -in 'all', 'claude') { Add-Target (Join-Path $HOME '.claude\skills') }
  if ($Agent -in 'all', 'codex') { Add-Target (Join-Path $HOME '.agents\skills') }
  if ($Agent -in 'all', 'antigravity') { Add-Target (Join-Path $HOME '.gemini\config\skills') }
}

foreach ($dir in $targets) {
  $dest = Join-Path $dir $Name
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
  # robocopy: copy everything except a local node_modules / build output
  $skip = 'node_modules', 'dist', 'dist-single', 'qa', '.content-backup' | ForEach-Object { Join-Path $Src "template\$_" }
  robocopy $Src $dest /E /XD $skip /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "Sao chép thất bại: $dest" }
  Write-Host "✔ $dest"
}
$global:LASTEXITCODE = 0
Write-Host 'Xong. Khởi động lại agent rồi yêu cầu: "Tạo slide 3D tương tác về <chủ đề>".'
