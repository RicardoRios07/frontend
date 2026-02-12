"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Search, Shield, User as UserIcon, Mail, Calendar } from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  role: "USER" | "ADMIN"
  createdAt: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"

export default function AdminUsers() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (token) {
          apiClient.setToken(token)
        }
        const response = await fetch(`${API_BASE}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchUsers()
    }
  }, [token])

  const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
    if (!confirm(`¿Estás seguro de cambiar el rol de este usuario a ${newRole}?`)) return

    try {
      if (token) {
        apiClient.setToken(token)
      }
      await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      })
      
      setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)))
    } catch (error) {
      alert("Error al cambiar el rol del usuario")
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user._id.toLowerCase().includes(searchLower)
    )
  })

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    users: users.filter((u) => u.role === "USER").length,
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Usuarios</h1>
            <p className="text-slate-600">{stats.total} usuarios registrados • {stats.admins} administradores</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Administradores</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.admins}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Usuarios Regulares</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.users}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6 p-4 shadow-sm border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, email o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-white"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden shadow-xl border-slate-200">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-96">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-700 mb-2">No hay usuarios</p>
            <p className="text-slate-500">
              {searchTerm ? "No se encontraron resultados para tu búsqueda" : "Los usuarios aparecerán aquí cuando se registren"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-200">
                  <TableHead className="text-slate-900 font-bold">Usuario</TableHead>
                  <TableHead className="text-slate-900 font-bold">Email</TableHead>
                  <TableHead className="text-slate-900 font-bold">Rol</TableHead>
                  <TableHead className="text-slate-900 font-bold">Fecha de Registro</TableHead>
                  <TableHead className="text-slate-900 font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{user._id.slice(-8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        } font-semibold border`}
                      >
                        {user.role === "ADMIN" ? (
                          <Shield className="w-3 h-3 mr-1 inline" />
                        ) : (
                          <UserIcon className="w-3 h-3 mr-1 inline" />
                        )}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(user.createdAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role === "ADMIN" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleChange(user._id, "USER")}
                          className="bg-white hover:bg-red-50 border-slate-300 hover:border-red-300 text-red-600"
                        >
                          Quitar Admin
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleChange(user._id, "ADMIN")}
                          className="bg-white hover:bg-purple-50 border-slate-300 hover:border-purple-300 text-purple-600"
                        >
                          Hacer Admin
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
