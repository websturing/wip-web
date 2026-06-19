import re

# 1. Update layout.tsx
layout_file = "app/admin/layout.tsx"
with open(layout_file, "r") as f:
    layout_content = f.read()

layout_content = re.sub(
    r"const \[isSidebarOpen, setIsSidebarOpen\] = useState\(false\);",
    "const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);",
    layout_content
)

layout_content = re.sub(
    r"<AdminSidebar />",
    "<AdminSidebar isCollapsed={isSidebarCollapsed} />",
    layout_content
)

layout_content = re.sub(
    r"<AdminNavbar onToggleSidebar=\{\(\) => setIsSidebarOpen\(true\)\} isScrolled=\{isScrolled\} />",
    "<AdminNavbar onToggleSidebar={() => setIsSidebarOpen(true)} isScrolled={isScrolled} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />",
    layout_content
)

with open(layout_file, "w") as f:
    f.write(layout_content)

# 2. Update AdminNavbar.tsx
navbar_file = "app/admin/components/AdminNavbar.tsx"
with open(navbar_file, "r") as f:
    navbar_content = f.read()

navbar_content = re.sub(
    r"interface AdminNavbarProps \{(.*?)\}",
    "interface AdminNavbarProps {\\1    isCollapsed?: boolean;\n    onToggleCollapse?: () => void;\n}",
    navbar_content,
    flags=re.DOTALL
)

navbar_content = re.sub(
    r"export const AdminNavbar = \(\{ onToggleSidebar, isScrolled = false \}: AdminNavbarProps\) => \{",
    "export const AdminNavbar = ({ onToggleSidebar, isScrolled = false, isCollapsed, onToggleCollapse }: AdminNavbarProps) => {",
    navbar_content
)

toggle_btn = """
                <button
                    onClick={onToggleCollapse}
                    className={cn(
                        "hidden lg:flex p-2 -ml-2 rounded-xl transition-colors shrink-0",
                        isScrolled ? "text-theme-text-muted hover:bg-theme-bg-primary" : "text-theme-text-muted hover:bg-[var(--theme-glass-hover-bg)]"
                    )}
                >
                    <Icon icon={isCollapsed ? "solar:sidebar-minimalistic-outline" : "solar:sidebar-minimalistic-bold-duotone"} className="w-6 h-6" />
                </button>
"""

navbar_content = re.sub(
    r"(<button\s+onClick=\{onToggleSidebar\}.*?</button>)",
    r"\1\n" + toggle_btn,
    navbar_content,
    flags=re.DOTALL
)

with open(navbar_file, "w") as f:
    f.write(navbar_content)

# 3. Update AdminSidebar.tsx
sidebar_file = "app/admin/components/AdminSidebar.tsx"
with open(sidebar_file, "r") as f:
    sidebar_content = f.read()

sidebar_content = re.sub(
    r"interface AdminSidebarProps \{(.*?)\}",
    "interface AdminSidebarProps {\\1    isCollapsed?: boolean;\n}",
    sidebar_content,
    flags=re.DOTALL
)

sidebar_content = re.sub(
    r"export const AdminSidebar = \(\{ isMobile, onClose \}: AdminSidebarProps\) => \{",
    "export const AdminSidebar = ({ isMobile, onClose, isCollapsed }: AdminSidebarProps) => {",
    sidebar_content
)

# Update width container
sidebar_content = re.sub(
    r'className="w-\[240px\] h-full flex flex-col rounded-xl transition-all duration-300 bg-\[\#334155\]"',
    'className={cn("h-full flex flex-col rounded-xl transition-all duration-300 bg-[#334155]", isCollapsed ? "w-[80px]" : "w-[240px]")}',
    sidebar_content
)

# Hide logo text
sidebar_content = re.sub(
    r'(<span className="text-sm font-bold text-theme-text-on-dark leading-tight">\s*\{process\.env\.NEXT_PUBLIC_APP_NAME \|\| \'Antigravity\'\}\s*</span>)',
    r'{!isCollapsed && \1}',
    sidebar_content
)
sidebar_content = re.sub(
    r'<div className="flex items-center gap-3">',
    r'<div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "gap-3")}>',
    sidebar_content
)


# Hide menu text
sidebar_content = re.sub(
    r'(<span className=\{cn\("text-\[13px\] capitalize", isActive \? "font-bold" : "font-bold"\)\}>\s*\{item\.name\}\s*</span>)',
    r'{!isCollapsed && \1}',
    sidebar_content
)

# Fix chevron icon
sidebar_content = re.sub(
    r'(\{item\.children && item\.children\.length > 0 && \()',
    r'{!isCollapsed && item.children && item.children.length > 0 && (',
    sidebar_content
)

# Hide badge
sidebar_content = re.sub(
    r'(\{item\.badge && \()',
    r'{!isCollapsed && item.badge && (',
    sidebar_content
)

# Adjust padding/justify for menu items when collapsed
sidebar_content = re.sub(
    r'"flex items-center justify-between px-4 py-2\.5 rounded-lg transition-all duration-200 cursor-pointer group mb-0\.5"',
    r'cn("flex items-center rounded-lg transition-all duration-200 cursor-pointer group mb-0.5", isCollapsed ? "justify-center py-2.5 px-0" : "justify-between px-4 py-2.5")',
    sidebar_content
)

# Hide user info
sidebar_content = re.sub(
    r'(<div className="flex flex-col min-w-0">.*?</div>)',
    r'{!isCollapsed && \1}',
    sidebar_content,
    flags=re.DOTALL
)

# Adjust logout flex when collapsed
sidebar_content = re.sub(
    r'"cursor-pointer transition-all flex items-center justify-between p-3 rounded-xl group hover:bg-\[var\(--theme-glass-hover-bg\)\].*?"',
    r'cn("cursor-pointer transition-all flex items-center rounded-xl group hover:bg-[var(--theme-glass-hover-bg)]", isCollapsed ? "justify-center p-2 flex-col gap-2" : "justify-between p-3")',
    sidebar_content
)

sidebar_content = re.sub(
    r'<div className="flex items-center gap-3 overflow-hidden">',
    r'<div className={cn("flex items-center overflow-hidden", isCollapsed ? "justify-center" : "gap-3")}>',
    sidebar_content
)

with open(sidebar_file, "w") as f:
    f.write(sidebar_content)

print("Updates completed.")
