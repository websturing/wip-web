import re

file_path = "app/admin/components/AdminNavbar.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update imports
if "useRef" not in content:
    content = content.replace("import { useEffect, useState } from 'react';", "import { useEffect, useState, useRef } from 'react';")

# 2. Add useRef and useEffect
if "const dropdownRef = useRef" not in content:
    state_code = """    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);"""
    content = content.replace("    const [isDropdownOpen, setIsDropdownOpen] = useState(false);", state_code)

# 3. Update Dropdown JSX
old_dropdown_pattern = r'\{/\* Dropdown Menu \*/\}.*?(?=\s*</div>\s*</div>\s*\)\s*;)'
# The above pattern might be fragile. Let's just use string replace.

old_dropdown_section = """                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute right-0 mt-3 w-56 bg-theme-bg-primary border border-theme-border rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">"""

new_dropdown_section = """                    {/* Dropdown Menu */}
                    <div 
                        className={cn(
                            "absolute right-0 mt-3 w-56 bg-theme-bg-primary border border-theme-border rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] z-50 p-2 transition-all duration-300 origin-top-right",
                            isDropdownOpen 
                                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                        )}
                    >"""

content = content.replace(old_dropdown_section, new_dropdown_section)

# Remove the closing </> from the old condition
content = content.replace("                            </div>\n                        </>\n                    )}\n                </div>", "                            </div>\n                    </div>\n                </div>")


# Update wrapper
content = content.replace('<div className="relative">', '<div className="relative" ref={dropdownRef}>')


with open(file_path, "w") as f:
    f.write(content)

print("Updated Dropdown Animation and Click Outside")
