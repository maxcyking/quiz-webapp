"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExam } from "@/context/exam-context";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Laptop, Loader2, Smartphone, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

interface Device {
  id: string;
  name: string;
  lastActive: any;
  browser: string;
  os: string;
  isCurrent: boolean;
  deviceType: "mobile" | "desktop" | "tablet" | "unknown";
}

// Mock data to show when no devices are returned
const getMockDevices = (): Device[] => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return [
    {
      id: "current-device",
      name: "Current Device",
      lastActive: new Date(),
      browser: getBrowserInfo(),
      os: getOSInfo(),
      isCurrent: true,
      deviceType: isMobile ? "mobile" : "desktop"
    }
  ];
};

// Helper functions to get device info
const getBrowserInfo = (): string => {
  const ua = navigator.userAgent;
  
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("MSIE") || ua.includes("Trident/")) return "Internet Explorer";
  
  return "Unknown Browser";
};

const getOSInfo = (): string => {
  const ua = navigator.userAgent;
  
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  
  return "Unknown OS";
};

export function ConnectedDevicesDialog() {
  const { getConnectedDevices, removeConnectedDevice } = useExam();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError("");
      
      let deviceData;
      try {
        deviceData = await getConnectedDevices();
      } catch (err) {
        console.error("Error fetching devices:", err);
        deviceData = [];
      }
      
      // Get current device info for comparison
      const currentBrowser = navigator.userAgent;
      
      // If no devices are returned, use mock data
      if (!deviceData || deviceData.length === 0) {
        setDevices(getMockDevices());
        setLoading(false);
        return;
      }
      
      // Transform and sort devices (current device first, then by last active date)
      const transformedDevices = deviceData
        .map(device => ({
          ...device,
          isCurrent: device.browser === currentBrowser,
          lastActive: device.lastActive ? new Date(device.lastActive) : new Date()
        }))
        .sort((a, b) => {
          if (a.isCurrent) return -1;
          if (b.isCurrent) return 1;
          return b.lastActive - a.lastActive;
        });
      
      setDevices(transformedDevices);
    } catch (error: any) {
      setError(error.message || "Failed to load devices");
      
      // Fall back to mock data
      setDevices(getMockDevices());
    } finally {
      setLoading(false);
    }
  };

  // Load devices when dialog is opened
  useEffect(() => {
    if (open) {
      loadDevices();
    }
  }, [open]);

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      setLoading(true);
      
      // Don't attempt to remove mock devices
      if (deviceId === "current-device") {
        toast({
          title: "Can't Remove Current Device",
          description: "You cannot remove the device you are currently using.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      await removeConnectedDevice(deviceId);
      
      // Update local state
      setDevices(devices.filter(device => device.id !== deviceId));
      
      toast({
        title: "Device Removed",
        description: "The device has been logged out and removed from your account.",
      });
    } catch (error: any) {
      setError(error.message || "Failed to remove device");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get device icon
  const getDeviceIcon = (device: Device) => {
    switch (device.deviceType) {
      case "mobile":
      case "tablet":
        return <Smartphone className="h-5 w-5" />;
      case "desktop":
      default:
        return <Laptop className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Manage Connected Devices</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connected Devices</DialogTitle>
          <DialogDescription>
            View and manage devices connected to your account
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="py-4">
          {loading && devices.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : devices.length > 0 ? (
            <div className="space-y-4">
              {devices.map(device => (
                <div 
                  key={device.id} 
                  className={`flex items-start justify-between p-4 rounded-lg border ${
                    device.isCurrent ? "bg-primary/5 border-primary/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-muted-foreground">
                      {getDeviceIcon(device)}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {device.name || "Unknown Device"}
                        {device.isCurrent && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {device.browser} • {device.os}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Last active: {format(new Date(device.lastActive), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                  
                  {!device.isCurrent && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveDevice(device.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No devices found</p>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-6">
            <p>Removing a device will log out that device immediately.</p>
            <p>You cannot remove your current device.</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={loadDevices} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 