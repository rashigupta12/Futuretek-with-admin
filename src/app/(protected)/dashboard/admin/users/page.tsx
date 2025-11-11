"use client";

import { TableContainer } from "@/components/admin/TableContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Filter, MoreVertical, Phone, Search, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  mobile: string;
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "USER" | "JYOTISHI";
  isActive: boolean;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    const url = roleFilter === "ALL" ? "/api/admin/users" : `/api/admin/users?role=${roleFilter}`;
    const res = await fetch(url);
    const data = await res.json();
    setUsers(data.users);
    setLoading(false);
  };

  // const handleDelete = async (id: string) => {
  //   if (!confirm("Delete this user?")) return;
  //   const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
  //   if (res.ok) {
  //     setUsers((prev) => prev.filter((u) => u.id !== id));
  //   }
  // };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleOptions = ["ALL", "ADMIN", "USER", "JYOTISHI"];

  return (
    <div className="p-4 w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Users</h2>
          <p className="text-muted-foreground mt-1">Manage users, roles, and access.</p>
        </div>
        {/* <Button asChild>
          <Link href="/dashboard/admin/users/add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Link>
        </Button> */}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === "ALL" ? "All Roles" : r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <TableContainer>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No users found.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-foreground">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {user.mobile ? (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {user.mobile}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === "ADMIN" ? "default" : user.role === "JYOTISHI" ? "secondary" : "outline"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                   <Badge variant={user.isActive ? "default" : "destructive"}>
  {user.isActive ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
  {user.isActive ? "Active" : "Inactive"}
</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-48 p-0">
                        <div className="flex flex-col">
                          <Link href={`/dashboard/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-none">
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          {/* <Link href={`/dashboard/admin/users/edit/${user.id}`}>
                            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-none">
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          </Link> */}
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 rounded-none"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button> */}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableContainer>
    </div>
  );
}