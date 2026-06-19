import re

file_path = "app/admin/components/AdminNavbar.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add imports
imports = """import { Button } from '@/app/components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/app/components/ui/Dialog';"""

if "import { Button }" not in content:
    content = content.replace("import { Icon } from '@/app/components/ui/Icon';", "import { Icon } from '@/app/components/ui/Icon';\n" + imports)


# 2. Add State
if "const [isLogoutDialogOpen" not in content:
    content = content.replace("const [isDropdownOpen, setIsDropdownOpen] = useState(false);", "const [isDropdownOpen, setIsDropdownOpen] = useState(false);\n    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);")

# 3. Update the sign out button click handler
old_sign_out = """                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            if (logout) logout();
                                            router.push('/login');
                                        }}"""

new_sign_out = """                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            setIsLogoutDialogOpen(true);
                                        }}"""
content = content.replace(old_sign_out, new_sign_out)

# 4. Add the Dialog at the end, right before the last closing div.
dialog_code = """
            {/* Logout Dialog */}
            <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <DialogContent className="max-w-[340px] bg-zinc-900 border-white/10 z-[60]">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                            <Icon icon="solar:danger-triangle-bold-duotone" className="w-6 h-6 text-red-500" />
                        </div>
                        <DialogTitle className="text-center font-bold text-white">Sign Out</DialogTitle>
                        <DialogDescription className="text-center mt-2 text-zinc-400">
                            Are you sure you want to end your current session?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-2 mt-6">
                        <Button variant="ghost" className="rounded-xl px-6 text-zinc-400 hover:text-white hover:bg-white/5" onClick={() => setIsLogoutDialogOpen(false)}>
                            Stay
                        </Button>
                        <Button variant="danger" className="rounded-xl px-6" onClick={() => { setIsLogoutDialogOpen(false); if (logout) logout(); }}>
                            Sign Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>"""

# Replace the end
content = content.replace("        </div>\n    );\n};", dialog_code + "\n        </div>\n    );\n};")

with open(file_path, "w") as f:
    f.write(content)

print("Added dialog successfully")
