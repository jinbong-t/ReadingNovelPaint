$src = "C:\Users\user\.gemini\antigravity-ide\brain\0901db38-7687-48a2-ac9d-ed9194105e2c"
$dst = "public\images"

$files = @{
  "event_card_design_1784084938305.png" = "card_bg.png"
  "nc_center_building_1784084949831.png" = "nc_center.png"
  "characters_hana_haeoruem_1784084960571.png" = "parents.png"
  "ending_illustrations_1784084983917.png" = "endings.png"
  "game_dice_token_1784084992766.png" = "dice_token.png"
}

foreach ($key in $files.Keys) {
  Copy-Item "$src\$key" "$dst\$($files[$key])"
  Write-Host "Copied $key -> $($files[$key])"
}
Write-Host "All done!"
