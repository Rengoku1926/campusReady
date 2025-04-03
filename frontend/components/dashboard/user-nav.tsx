// File: /components/dashboard/user-nav.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { useToast } from "@/components/ui/use-toast";

interface UserData {
  name?: string;
  email: string;
}

export function UserNav() {
  const router = useRouter();
//   const { toast } = useToast();
  const [user, setUser] = useState<UserData>({
    name: "User",
    email: "user@example.com",
  });

  // In a real application, you would fetch the user data from your auth service
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const response = await fetch('/api/user');
  //     if (response.ok) {
  //       const userData = await response.json();
  //       setUser(userData);
  //     }
  //   };
  //   fetchUserData();
  // }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sign out');
      }
      
    //   toast({
    //     title: "Signed out",
    //     description: "You have been signed out successfully",
    //   });
      
      // Redirect to login page
      router.push('/auth');
    } catch (error) {
      console.error(error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to sign out",
    //     variant: "destructive",
    //   });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/conversions">Conversions</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">Profile</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}