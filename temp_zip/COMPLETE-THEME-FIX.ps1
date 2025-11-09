# COMPREHENSIVE THEME FIX
# This script fixes ALL remaining theme issues in your Warehouse ERP
# Run from: C:\projects\warehouse-erp

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  COMPREHENSIVE THEME FIX" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$fixed = 0

# List of ALL files with theme issues
$files = @(
    "app\admin\brands\[id]\page.tsx",
    "app\admin\brands\create\page.tsx",
    "app\admin\brands\page.tsx",
    "app\admin\brands\update\page.tsx",
    "app\admin\brands\view\page.tsx",
    "app\admin\categories\[id]\page.tsx",
    "app\admin\categories\create\page.tsx",
    "app\admin\categories\page.tsx",
    "app\admin\categories\update\page.tsx",
    "app\admin\categories\view\page.tsx",
    "app\admin\subcategories\[id]\page.tsx",
    "app\admin\subcategories\create\page.tsx",
    "app\admin\subcategories\page.tsx",
    "app\admin\subcategories\update\page.tsx",
    "app\admin\subcategories\view\page.tsx",
    "app\customers\options\page.tsx",
    "app\products\[id]\page.tsx",
    "app\products\create\page.tsx",
    "app\purchase-orders\[id]\page.tsx",
    "app\purchase-orders\create\page.tsx",
    "app\purchase-orders\receive\page.tsx",
    "app\reports\customer-sales\page.tsx",
    "app\reports\discount-analysis\page.tsx",
    "app\reports\inventory-value\page.tsx",
    "app\reports\subcategory-analysis\page.tsx",
    "app\vendors\create\page.tsx",
    "app\vendors\[id]\page.tsx",
    "app\components\BrandForm.tsx",
    "app\components\CategoryForm.tsx",
    "app\components\ProductForm.tsx",
    "app\components\SubcategoryForm.tsx",
    "app\components\VendorForm.tsx",
    "app\components\PurchaseOrderForm.tsx"
)

Write-Host "Fixing $($files.Count) files..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file | Out-String
        $original = $content
        
        # Remove ALL gradients
        $content = $content -replace 'bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent', 'text-gray-900'
        $content = $content -replace 'bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent', 'text-gray-900'
        $content = $content -replace 'bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent', 'text-gray-900'
        $content = $content -replace 'bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent', 'text-primary-700'
        $content = $content -replace 'bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent', 'text-gray-900'
        $content = $content -replace 'bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent', 'text-gray-900'
        $content = $content -replace 'bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent', 'text-gray-900'
        
        # Remove group hover gradients
        $content = $content -replace 'group-hover:from-blue-300 group-hover:to-blue-500', ''
        $content = $content -replace 'group-hover:from-green-300 group-hover:to-green-500', ''
        $content = $content -replace 'group-hover:from-purple-300 group-hover:to-purple-500', ''
        
        # Fix fluorescent colors
        $content = $content -replace 'text-cyan-400', 'text-gray-900'
        $content = $content -replace 'text-green-300', 'text-success'
        $content = $content -replace 'text-blue-300', 'text-primary-600'
        $content = $content -replace 'text-purple-300', 'text-primary-600'
        $content = $content -replace 'text-pink-300', 'text-primary-600'
        $content = $content -replace 'group-hover:text-green-300', 'group-hover:text-primary-700'
        $content = $content -replace 'group-hover:text-blue-300', 'group-hover:text-primary-700'
        $content = $content -replace 'group-hover:text-purple-300', 'group-hover:text-primary-700'
        
        # Remove scale effects
        $content = $content -replace 'hover:scale-105 transition-transform', 'hover:border-primary-300 hover:shadow-md transition-all duration-200'
        $content = $content -replace 'hover:scale-105', ''
        
        # Remove ALL colored shadows (green, blue, purple, etc)
        $content = $content -replace 'shadow-\[0_0_15px_rgba\(34,197,94,0\.3\)\]', 'shadow-sm'
        $content = $content -replace 'shadow-\[0_0_15px_rgba\(59,130,246,0\.3\)\]', 'shadow-sm'
        $content = $content -replace 'shadow-\[0_0_15px_rgba\(147,51,234,0\.3\)\]', 'shadow-sm'
        $content = $content -replace 'shadow-\[0_0_15px_rgba\([0-9,\.]+\)\]', 'shadow-sm'
        $content = $content -replace 'hover:shadow-blue-500/50', ''
        $content = $content -replace 'hover:shadow-green-500/50', ''
        $content = $content -replace 'hover:shadow-purple-500/50', ''
        $content = $content -replace 'shadow-lg hover:shadow-blue-500/50', 'shadow-sm'
        
        # Fix dark form inputs to light theme
        $content = $content -replace 'bg-gray-900 border border-gray-600 text-white', 'bg-white border border-gray-300 text-gray-900'
        $content = $content -replace 'bg-gray-900 border-gray-600', 'bg-white border-gray-300'
        $content = $content -replace 'text-white font-medium', 'text-sm font-medium text-gray-700'
        $content = $content -replace 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500', 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
        $content = $content -replace 'label className="block text-white', 'label className="block text-sm font-medium text-gray-700'
        
        # Fix dark buttons
        $content = $content -replace 'bg-green-600 text-white font-medium rounded-lg hover:bg-green-700', 'bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700'
        $content = $content -replace 'bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600', 'bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 border border-gray-300'
        
        if ($content -ne $original) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  Fixed: $file" -ForegroundColor Green
            $fixed++
        }
    } else {
        Write-Host "  Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Fixed $fixed files!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Restart dev server (Ctrl+C, then: npm run dev)" -ForegroundColor White
Write-Host "2. Clear browser cache (Ctrl+Shift+Del)" -ForegroundColor White
Write-Host "3. Hard refresh all pages (Ctrl+Shift+R)" -ForegroundColor White
Write-Host ""
