import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUsers, getRoles, createUser, updateUser, deleteUser, generateId, logAudit } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import type { User, Role, RoleName } from '@/lib/types';
import { READ_ONLY_ROLES } from '@/lib/types';
import { ArrowLeft, Plus, Pencil, Trash2, RotateCcw, ShieldAlert, UserPlus, Users } from 'lucide-react';

interface UserManagementProps {
  onBack: () => void;
}

export default function UserManagement({ onBack }: UserManagementProps) {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form state
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRoleId, setFormRoleId] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive' | 'locked'>('active');

  const loadData = useCallback(async () => {
    const [u, r] = await Promise.all([getUsers(), getRoles()]);
    setUsers(u);
    setRoles(r);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Unknown';
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormPassword('');
    setFormRoleId('');
    setFormStatus('active');
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormPassword('');
    setFormRoleId(user.roleId);
    setFormStatus(user.status);
    setError('');
    setDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleResetPassword = async (user: User) => {
    const newPassword = 'reset123';
    await updateUser({ ...user, password: newPassword });
    if (currentUser) {
      await logAudit(currentUser.id, 'RESET_PASSWORD', `Reset password for ${user.username}`);
    }
    await loadData();
  };

  const handleSubmit = async () => {
    setError('');

    if (formUsername.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!editingUser && formPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (!formRoleId) {
      setError('Please select a role');
      return;
    }

    // Check duplicate username
    const existing = users.find(u => u.username === formUsername.trim() && u.id !== editingUser?.id);
    if (existing) {
      setError('Username already exists');
      return;
    }

    setLoading(true);
    try {
      if (editingUser) {
        const updated: User = {
          ...editingUser,
          username: formUsername.trim(),
          roleId: formRoleId,
          status: formStatus,
          ...(formPassword ? { password: formPassword } : {}),
        };
        await updateUser(updated);
        if (currentUser) {
          await logAudit(currentUser.id, 'UPDATE_USER', `Updated user ${updated.username}`);
        }
      } else {
        const userId = generateId();
        await createUser({
          id: userId,
          roleId: formRoleId,
          username: formUsername.trim(),
          password: formPassword,
          status: formStatus,
          createdAt: new Date().toISOString(),
        });
        if (currentUser) {
          await logAudit(currentUser.id, 'CREATE_USER', `Created user ${formUsername.trim()}`);
        }
      }

      setDialogOpen(false);
      await loadData();
    } catch {
      setError('Operation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    if (deletingUser.id === currentUser?.id) return;

    await deleteUser(deletingUser.id);
    if (currentUser) {
      await logAudit(currentUser.id, 'DELETE_USER', `Deleted user ${deletingUser.username}`);
    }
    setDeleteDialogOpen(false);
    setDeletingUser(null);
    await loadData();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'locked': return 'destructive';
      default: return 'outline';
    }
  };

  const roleVariant = (roleName: string) => {
    if (roleName === 'Super Admin') return 'default';
    if (READ_ONLY_ROLES.includes(roleName as RoleName)) return 'outline';
    return 'secondary';
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">User Management</h1>
            <p className="text-xs text-muted-foreground">{users.length} users registered</p>
          </div>
          <Button size="sm" onClick={openCreateDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.status === 'active').length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.status === 'inactive').length}</p>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.status === 'locked').length}</p>
                <p className="text-xs text-muted-foreground">Locked</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariant(getRoleName(user.roleId))}>
                        {getRoleName(user.roleId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleResetPassword(user)} title="Reset Password">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)} title="Delete" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found. Click "Add User" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user details below.' : 'Fill in the details to create a new user.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="dlg-username">Username</Label>
              <Input
                id="dlg-username"
                value={formUsername}
                onChange={e => setFormUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dlg-password">
                Password {editingUser && <span className="text-muted-foreground text-xs">(leave blank to keep current)</span>}
              </Label>
              <Input
                id="dlg-password"
                type="password"
                value={formPassword}
                onChange={e => setFormPassword(e.target.value)}
                placeholder={editingUser ? '••••••••' : 'Enter password'}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formRoleId} onValueChange={setFormRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formStatus} onValueChange={(v) => setFormStatus(v as 'active' | 'inactive' | 'locked')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingUser?.username}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card py-2 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold">Software Vala™</span>
        </p>
      </footer>
    </div>
  );
}
