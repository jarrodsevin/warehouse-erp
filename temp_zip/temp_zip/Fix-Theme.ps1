# Theme Fix Script - Removes ALL gradients and fluorescent colors from your project
# Run this from your project root: C:\projects\warehouse-erp

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  Theme Fix Script - Removing Old Theme" -ForegroundColor Cyan  
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

$fixedCount = 0
$files = @(
    "app\vendors\view\page.tsx",
    "app\vendors\create\page.tsx",
    "app\vendors\update\page.tsx",
    "app\vendors\[id]\page.tsx",
    "app\customers\options\page.tsx",
    "app\reports\inventory-value\page.tsx",
    "app\reports\subcategory-analysis\page.tsx",
    "app\reports\discount-analysis\page.tsx",
    "app\reports\customer-sales\page.tsx",
    "app\admin\subcategories\view\page.tsx",
    "app\admin\subcategories\create\page.tsx",
    "app\admin\subcategories\update\page.tsx",
    "app\admin\subcategories\page.tsx",
    "app\admin\subcategories\[id]\page.tsx",
    "app\admin\categories\view\page.tsx",
    "app\admin\categories\create\page.tsx",
    "app\admin\categories\update\page.tsx",
    "app\admin\categories\page.tsx",
    "app\admin\categories\[id]\page.tsx",
    "app\admin\brands\view\page.tsx",
    "app\admin\brands\create\page.tsx",
    "app\admin\brands\update\page.tsx",
    "app\admin\brands\page.tsx",
    "app\admin\brands\[id]\page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $original = $content
        
        # Remove ALL gradient patterns
        $content = $content -replace 'bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent', 'text-gray-900'
        $content = $content -replace 'bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent', 'text-gray-900'
        $content = $content -replace 'bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent', 'text-gray-900'
        $content = $content -replace 'bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent', 'text-primary-700'
        $content = $content -replace 'bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent', 'text-gray-900'
        
        # Remove group hover gradients
        $content = $content -replace 'group-hover:from-blue-300 group-hover:to-blue-500', ''
        $content = $content -replace 'group-hover:from-green-300 group-hover:to-green-500', ''
        $content = $content -replace 'group-hover:from-purple-300 group-hover:to-purple-500', ''
        
        # Replace fluorescent colors
        $content = $content -replace 'text-green-300', 'text-success'
        $content = $content -replace 'text-blue-300', 'text-primary-600'
        $content = $content -replace 'text-purple-300', 'text-primary-600'
        $content = $content -replace 'text-pink-300', 'text-primary-600'
        $content = $content -replace 'text-cyan-300', 'text-info'
        $content = $content -replace 'group-hover:text-green-300', 'group-hover:text-primary-700'
        $content = $content -replace 'group-hover:text-blue-300', 'group-hover:text-primary-700'
        $content = $content -replace 'group-hover:text-purple-300', 'group-hover:text-primary-700'
        
        # Remove scale effects
        $content = $content -replace 'hover:scale-105 transition-transform', 'hover:border-primary-300 hover:shadow-md transition-all duration-200'
        $content = $content -replace 'hover:scale-105', ''
        
        # Remove colored shadows
        $content = $content -replace 'hover:shadow-blue-500/50', ''
        $content = $content -replace 'hover:shadow-green-500/50', ''
        $content = $content -replace 'hover:shadow-purple-500/50', ''
        $content = $content -replace 'shadow-lg hover:shadow-blue-500/50', 'shadow-sm'
        
        # Clean up double spaces in className
        $content = $content -replace '\s{2,}', ' '
        $content = $content -replace 'className="\s+', 'className="'
        $content = $content -replace '\s+">', '">'
        
        if ($content -ne $original) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "✓ Fixed: $file" -ForegroundColor Green
            $fixedCount++
        }
    } else {
        Write-Host "⚠ Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  Fixed $fixedCount files" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your dev server (Ctrl+C, then: npm run dev)" -ForegroundColor White
Write-Host "2. Clear browser cache (Ctrl+Shift+Del)" -ForegroundColor White
Write-Host "3. Hard refresh pages (Ctrl+Shift+R)" -ForegroundColor White
