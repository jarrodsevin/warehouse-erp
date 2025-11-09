# Quick Theme Reference Guide

## 🎨 Copy-Paste Theme Patterns

Use this guide to apply the theme to new pages quickly.

---

## Pattern 1: Basic Menu Page (Most Common)

```tsx
import PageLayout from '../components/PageLayout'
import Link from 'next/link'

const actions = [
  {
    title: 'Action Name',
    description: 'Action description',
    href: '/path/to/action',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )
  },
  // Add more actions...
]

export default function YourPage() {
  return (
    <PageLayout 
      title="Your Page Title" 
      subtitle="Your page description"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Your Page' }
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 mb-4 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
              {action.icon}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
              {action.title}
            </h2>
            <p className="text-sm text-gray-600">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </PageLayout>
  )
}
```

---

## Pattern 2: Dashboard-Style Page

```tsx
import Sidebar from './components/Sidebar'

export default function CustomDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Page Title</h1>
            <p className="text-gray-600 mt-1">Page description</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Your content here */}
        </div>
      </main>
    </div>
  )
}
```

---

## Pattern 3: Data Table/List Page

```tsx
import PageLayout from '../components/PageLayout'

export default function DataListPage() {
  return (
    <PageLayout 
      title="Data List" 
      subtitle="Browse and manage data"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Data' }
      ]}
    >
      {/* Data Table Container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Column 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Column 2
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Data 1
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Data 2
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  )
}
```

---

## Pattern 4: Form Page

```tsx
import PageLayout from '../components/PageLayout'

export default function FormPage() {
  return (
    <PageLayout 
      title="Create/Edit Item" 
      subtitle="Enter item details"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Items', href: '/items' },
        { label: 'Create' }
      ]}
    >
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form>
            {/* Form Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Label
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter value"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  )
}
```

---

## Common Component Patterns

### Metric/Stats Card
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
  <div className="flex items-center justify-between mb-4">
    <span className="text-gray-600 text-sm font-medium">Metric Label</span>
    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
      {/* Icon */}
    </div>
  </div>
  <div className="text-3xl font-semibold text-gray-900">Value</div>
</div>
```

### Badge
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
  Badge Text
</span>
```

### Alert/Notice
```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <p className="text-sm text-blue-800">Notice message here</p>
</div>
```

### Section Header
```tsx
<div className="mb-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-1">Section Title</h2>
  <p className="text-sm text-gray-600">Section description</p>
</div>
```

---

## Grid Layouts

### 2-Column
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Items */}
</div>
```

### 3-Column
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

### 4-Column
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Items */}
</div>
```

---

## Color Usage Guide

### Text Colors
- **Headings**: `text-gray-900`
- **Body**: `text-gray-600`
- **Muted**: `text-gray-500`
- **Links**: `text-primary-600 hover:text-primary-700`
- **Active**: `text-primary-700`

### Background Colors
- **Page**: `bg-gray-50`
- **Cards**: `bg-white`
- **Hover**: `hover:bg-gray-50`
- **Primary Light**: `bg-primary-50`
- **Primary**: `bg-primary-600`

### Border Colors
- **Default**: `border-gray-200`
- **Hover**: `hover:border-primary-300`
- **Focus**: `focus:ring-primary-500`

---

## Transitions

Always add smooth transitions:
```tsx
className="transition-all duration-200"
// or
className="transition-colors duration-200"
```

---

## Responsive Design

Follow this pattern:
```tsx
// Mobile first, then tablet (md), then desktop (lg)
className="text-sm md:text-base lg:text-lg"
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## Best Practices

1. ✅ Always use `PageLayout` for consistency
2. ✅ Use `group` and `group-hover:` for card hover effects
3. ✅ Add `transition-all duration-200` for smooth interactions
4. ✅ Keep icon containers at `w-12 h-12` (or `w-10 h-10` for compact layouts)
5. ✅ Use `rounded-lg` for cards and buttons
6. ✅ Maintain consistent spacing with `p-6` for cards, `p-8` for page content
7. ✅ Use semantic HTML (nav, main, aside, etc.)
8. ✅ Test responsive behavior on mobile, tablet, and desktop

---

## Don't Do This ❌

- ❌ Use dark theme colors (we're light theme only)
- ❌ Use different primary colors (always use the indigo palette)
- ❌ Create custom rounded corners (stick to `rounded-lg`)
- ❌ Mix different card styles on the same page
- ❌ Forget hover states on interactive elements
- ❌ Use inline styles (use Tailwind classes)
- ❌ Skip the PageLayout component (unless you're building a dashboard)

---

**Keep this guide handy when creating new pages!**
