"use client";

import { useState, useEffect } from "react";
import { useExam } from "@/context/exam-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Trash,
  User,
  Users,
  Search,
  Filter,
  CreditCard,
  Clock,
  Calendar,
  ChevronDown,
  Wallet,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Shield,
  Activity,
  DollarSign,
  BarChart3,
  Loader2,
  Table as TableIcon,
  LayoutGrid as LayoutGridIcon,
  BookOpen as BookOpenIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  where, 
  orderBy, 
  getDoc,
  Timestamp,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { convertFirebaseTimestamp } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";

// Type for user data
interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  isAdmin: boolean;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  updatedAt?: Timestamp;
  userStats?: {
    totalExams: number;
    completedExams: number;
    averageScore: number;
    pendingRewards: number;
    processingRewards: number;
    totalRewards: number;
  };
  isVerified?: boolean;
  isOnline?: boolean;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountName: string;
    bankName: string;
    upiId?: string;
  };
}

// UserCard component
const UserCard = ({ 
  user, 
  onEdit, 
  onDelete, 
  onViewDetails 
}: { 
  user: UserData; 
  onEdit: () => void; 
  onDelete: () => void;
  onViewDetails: () => void;
}) => {
  const formattedDate = convertFirebaseTimestamp(user.createdAt)?.toLocaleDateString() || 'Unknown';
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL} />
              <AvatarFallback>
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-1">
                {user.name}
                {user.isAdmin && (
                  <Badge variant="outline" className="ml-1 h-5 bg-primary/10 text-primary text-xs">
                    Admin
                  </Badge>
                )}
                {user.isVerified && (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 ml-1" />
                )}
              </CardTitle>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onViewDetails}
              className="h-8 w-8"
            >
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Joined {formattedDate}
            </span>
            {user.isOnline && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Online
              </Badge>
            )}
          </div>
          
          {/* Bank status */}
          <div className="flex items-center text-sm">
            <CreditCard className="h-3.5 w-3.5 mr-1.5" />
            {user.bankDetails ? (
              <span className="text-green-600">Bank Details Added</span>
            ) : (
              <span className="text-muted-foreground">No Bank Details</span>
            )}
          </div>
          
          {/* Rewards */}
          {user.userStats && (
            <div className="flex justify-between items-center pt-1">
              <div>
                <div className="text-xs text-muted-foreground">Total Rewards</div>
                <div className="font-bold">₹{user.userStats.totalRewards.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Pending</div>
                <div className="font-bold">₹{user.userStats.pendingRewards.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Exams</div>
                <div className="font-bold">{user.userStats.totalExams}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// UsersTable component
const UsersTable = ({ 
  users, 
  onEdit, 
  onDelete,
  onViewDetails 
}: { 
  users: UserData[]; 
  onEdit: (user: UserData) => void; 
  onDelete: (user: UserData) => void;
  onViewDetails: (user: UserData) => void;
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Rewards</TableHead>
            <TableHead className="text-right">Exams</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback>
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center">
                      {user.name}
                      {user.isAdmin && (
                        <Badge 
                          variant="outline" 
                          className="ml-1.5 h-5 bg-primary/10 text-primary text-[10px]"
                        >
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {user.isOnline ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                      Offline
                    </Badge>
                  )}
                  {user.isVerified && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Verified
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-xs flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {user.email}
                  </div>
                  {user.phoneNumber && (
                    <div className="text-xs flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {user.phoneNumber}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {convertFirebaseTimestamp(user.createdAt)?.toLocaleDateString() || 'Unknown'}
              </TableCell>
              <TableCell className="text-right">
                {user.userStats ? (
                  <div>
                    <div className="font-medium">₹{user.userStats.totalRewards.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      ₹{user.userStats.pendingRewards.toLocaleString()} pending
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">₹0</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {user.userStats ? (
                  <div>
                    <div className="font-medium">{user.userStats.totalExams}</div>
                    {user.userStats.averageScore > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {user.userStats.averageScore.toFixed(1)}% avg
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(user)}
                    className="h-8 w-8"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(user)}
                    className="h-8 w-8"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    admins: 0,
    regularUsers: 0,
    verifiedUsers: 0,
    usersWithBankDetails: 0,
    recentlyActive: 0,
    totalRewards: 0,
    pendingRewards: 0,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    isAdmin: false,
    isVerified: false
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(collection(db, "users"));
      const snapshot = await getDocs(usersQuery);
      
      // Get all users with their basic info
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          photoURL: data.photoURL || '',
          isAdmin: data.isAdmin || false,
          createdAt: data.createdAt || new Date(),
          lastLogin: data.lastLogin,
          updatedAt: data.updatedAt,
          isVerified: data.isVerified || false,
          isOnline: data.isOnline || false,
        } as UserData;
      });
      
      // Fetch additional user statistics
      const enhancedUsers = await Promise.all(
        usersData.map(async (user) => {
          try {
            // Get user stats if they exist
            const userStatsDoc = await getDoc(doc(db, "userStats", user.id));
            if (userStatsDoc.exists()) {
              const statsData = userStatsDoc.data();
              user.userStats = {
                totalExams: statsData.totalExams || 0,
                completedExams: statsData.completedExams || 0,
                averageScore: statsData.averageScore || 0,
                pendingRewards: statsData.pendingRewards || 0,
                processingRewards: statsData.processingRewards || 0,
                totalRewards: statsData.totalRewards || 0
              };
            }
            
            // Check for bank details
            const bankDetailsDoc = await getDoc(doc(db, "bankDetails", user.id));
            if (bankDetailsDoc.exists()) {
              const bankData = bankDetailsDoc.data();
              user.bankDetails = {
                accountNumber: bankData.accountNumber || '',
                ifscCode: bankData.ifscCode || '',
                accountName: bankData.accountName || '',
                bankName: bankData.bankName || '',
                upiId: bankData.upiId || ''
              };
            }
            
            return user;
          } catch (err) {
            console.error(`Error fetching details for user ${user.id}:`, err);
            return user;
          }
        })
      );
      
      setUsers(enhancedUsers);
      
      // Calculate user statistics
      const stats = {
        totalUsers: enhancedUsers.length,
        admins: enhancedUsers.filter(u => u.isAdmin).length,
        regularUsers: enhancedUsers.filter(u => !u.isAdmin).length,
        verifiedUsers: enhancedUsers.filter(u => u.isVerified).length,
        usersWithBankDetails: enhancedUsers.filter(u => u.bankDetails).length,
        recentlyActive: enhancedUsers.filter(u => {
          if (!u.lastLogin) return false;
          const lastLoginDate = convertFirebaseTimestamp(u.lastLogin);
          if (!lastLoginDate) return false;
          
          const now = new Date();
          const daysDifference = Math.floor(
            (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysDifference < 7; // Active in the last 7 days
        }).length,
        totalRewards: enhancedUsers.reduce((sum, user) => 
          sum + (user.userStats?.totalRewards || 0), 0),
        pendingRewards: enhancedUsers.reduce((sum, user) => 
          sum + (user.userStats?.pendingRewards || 0), 0),
      };
      
      setUserStats(stats);
      
      // Count active users (users who are currently online)
      setActiveUserCount(enhancedUsers.filter(u => u.isOnline).length);
      
      // Apply initial filtering
      filterUsers(enhancedUsers, searchQuery, currentTab, sortField, sortDirection);
      
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to filter and sort users
  const filterUsers = (
    usersList = users,
    query = searchQuery,
    tab = currentTab,
    field = sortField,
    direction = sortDirection
  ) => {
    // First apply tab filter
    let filtered = [...usersList];
    
    if (tab === "admins") {
      filtered = filtered.filter(user => user.isAdmin);
    } else if (tab === "regular") {
      filtered = filtered.filter(user => !user.isAdmin);
    } else if (tab === "verified") {
      filtered = filtered.filter(user => user.isVerified);
    } else if (tab === "withBank") {
      filtered = filtered.filter(user => !!user.bankDetails);
    } else if (tab === "withRewards") {
      filtered = filtered.filter(user => 
        (user.userStats?.pendingRewards || 0) > 0 || 
        (user.userStats?.processingRewards || 0) > 0
      );
    }
    
    // Then apply search filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        (user.phoneNumber && user.phoneNumber.includes(query))
      );
    }
    
    // Then sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      // Get values to compare based on the sort field
      switch (field) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "rewards":
          aValue = a.userStats?.totalRewards || 0;
          bValue = b.userStats?.totalRewards || 0;
          break;
        case "pending":
          aValue = a.userStats?.pendingRewards || 0;
          bValue = b.userStats?.pendingRewards || 0;
          break;
        case "date":
          aValue = convertFirebaseTimestamp(a.createdAt)?.getTime() || 0;
          bValue = convertFirebaseTimestamp(b.createdAt)?.getTime() || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      // Compare based on direction
      if (direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredUsers(filtered);
  };
  
  // Apply filtering when any filter changes
  useEffect(() => {
    if (users.length > 0) {
      filterUsers();
    }
  }, [searchQuery, currentTab, sortField, sortDirection]);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);

      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        isAdmin: formData.isAdmin,
        isVerified: formData.isVerified,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, "users", selectedUser.id), updateData);

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setShowEditDialog(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      await deleteDoc(doc(db, "users", selectedUser.id));

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      setShowConfirmDeleteDialog(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      // Toggle direction if clicking on the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and reset direction to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const prepareUserForEdit = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      isAdmin: user.isAdmin,
      isVerified: user.isVerified || false
    });
    setShowEditDialog(true);
  };
  
  const viewUserDetails = (user: UserData) => {
    setSelectedUser(user);
    setShowUserDetailsDialog(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold">User Management</h2>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>{activeUserCount} Active Now</span>
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
            {userStats.totalUsers} Total Users
          </Badge>
        </div>
      </div>

      {/* User Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <Users className="h-3 w-3 mr-1" />
              <span>{userStats.admins} Admins, {userStats.regularUsers} Regular</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.usersWithBankDetails}</div>
            <div className="mt-1">
              <Progress 
                value={(userStats.usersWithBankDetails / userStats.totalUsers) * 100} 
                className="h-2 w-full"
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round((userStats.usersWithBankDetails / userStats.totalUsers) * 100)}% of users
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{userStats.totalRewards.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              <span>₹{userStats.pendingRewards.toLocaleString()} pending</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.recentlyActive}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              <span>In the last 7 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Sort By
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSortChange("name")}>
                Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("email")}>
                Email {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("date")}>
                Join Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("rewards")}>
                Total Rewards {sortField === "rewards" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("pending")}>
                Pending Rewards {sortField === "pending" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
          >
            {viewMode === "grid" ? 
              <TableIcon className="h-4 w-4 mr-2" /> : 
              <LayoutGridIcon className="h-4 w-4 mr-2" />
            }
            {viewMode === "grid" ? "Table View" : "Grid View"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="w-full md:w-auto flex overflow-auto">
          <TabsTrigger value="all" className="flex-1">All Users</TabsTrigger>
          <TabsTrigger value="admins" className="flex-1">Admins</TabsTrigger>
          <TabsTrigger value="regular" className="flex-1">Regular Users</TabsTrigger>
          <TabsTrigger value="verified" className="flex-1">Verified</TabsTrigger>
          <TabsTrigger value="withBank" className="flex-1">With Bank</TabsTrigger>
          <TabsTrigger value="withRewards" className="flex-1">With Rewards</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading users...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg border border-dashed">
          <Users className="h-12 w-12 text-muted mb-2" />
          <h3 className="text-xl font-medium">No users found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? "Try a different search query or filter" : "There are no users to display"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard 
              key={user.id} 
              user={user}
              onEdit={() => prepareUserForEdit(user)}
              onDelete={() => {
                setSelectedUser(user);
                setShowConfirmDeleteDialog(true);
              }}
              onViewDetails={() => viewUserDetails(user)}
            />
          ))}
        </div>
      ) : (
        <UsersTable 
          users={filteredUsers} 
          onEdit={prepareUserForEdit}
          onDelete={(user) => {
            setSelectedUser(user);
            setShowConfirmDeleteDialog(true);
          }}
          onViewDetails={viewUserDetails}
        />
      )}

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details and permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isAdmin">Admin Access</Label>
              <Switch
                id="isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isVerified">Verified User</Label>
              <Switch
                id="isVerified"
                checked={formData.isVerified}
                onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedUser.photoURL} />
                  <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedUser.name}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="py-4 space-y-6">
                {/* User Profile */}
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedUser.photoURL} />
                    <AvatarFallback className="text-lg">{selectedUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xl font-bold flex items-center">
                      {selectedUser.name}
                      {selectedUser.isAdmin && (
                        <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">Admin</Badge>
                      )}
                      {selectedUser.isVerified && (
                        <Badge variant="outline" className="ml-2 bg-green-100 text-green-700">Verified</Badge>
                      )}
                    </h3>
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-1" />
                      <span>{selectedUser.email}</span>
                    </div>
                    {selectedUser.phoneNumber && (
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="h-4 w-4 mr-1" />
                        <span>{selectedUser.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Member since {convertFirebaseTimestamp(selectedUser.createdAt)?.toLocaleDateString()}</span>
                    </div>
                    {selectedUser.lastLogin && (
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Last login {formatDistanceToNow(
                          convertFirebaseTimestamp(selectedUser.lastLogin) || new Date(), 
                          { addSuffix: true }
                        )}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Wallet & Rewards */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Wallet & Rewards</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-muted-foreground">Total Rewards</div>
                          <Wallet className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold mt-1">
                          ₹{selectedUser.userStats?.totalRewards?.toLocaleString() || "0"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-muted-foreground">Pending</div>
                          <Clock className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold mt-1">
                          ₹{selectedUser.userStats?.pendingRewards?.toLocaleString() || "0"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-muted-foreground">Processing</div>
                          <Activity className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold mt-1">
                          ₹{selectedUser.userStats?.processingRewards?.toLocaleString() || "0"}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Bank Details */}
                {selectedUser.bankDetails ? (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Bank Details</h3>
                    <Card>
                      <CardContent className="pt-6 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <div className="text-sm text-muted-foreground">Account Name</div>
                            <div className="font-medium">{selectedUser.bankDetails.accountName}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Bank Name</div>
                            <div className="font-medium">{selectedUser.bankDetails.bankName}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Account Number</div>
                            <div className="font-medium">
                              {selectedUser.bankDetails.accountNumber.replace(/(\d{4})(\d+)(\d{4})/, '$1********$3')}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">IFSC Code</div>
                            <div className="font-medium">{selectedUser.bankDetails.ifscCode}</div>
                          </div>
                        </div>
                        {selectedUser.bankDetails.upiId && (
                          <div>
                            <div className="text-sm text-muted-foreground">UPI ID</div>
                            <div className="font-medium">{selectedUser.bankDetails.upiId}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No bank details provided</p>
                  </div>
                )}
                
                {/* Exam Statistics */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Exam Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-muted-foreground">Total Exams</div>
                          <BookOpenIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold mt-1">
                          {selectedUser.userStats?.totalExams || "0"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-muted-foreground">Completed</div>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold mt-1">
                          {selectedUser.userStats?.completedExams || "0"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-muted-foreground">Avg. Score</div>
                          <BarChart3 className="h-4 w-4 text-violet-500" />
                        </div>
                        <div className="text-2xl font-bold mt-1">
                          {selectedUser.userStats?.averageScore?.toFixed(1) || "0"}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => prepareUserForEdit(selectedUser)}
                className="mr-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
              <Button onClick={() => setShowUserDetailsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}