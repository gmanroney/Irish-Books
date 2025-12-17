import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { RotateCcw } from "lucide-react";

export default function SettingsPage() {
  const { company, resetData } = useAppStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-heading">Settings</h2>
          <p className="text-muted-foreground">Manage company details and configuration.</p>
        </div>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="vat">VAT & Tax</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Your legal entity information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="cname">Company Name</Label>
                <Input id="cname" defaultValue={company.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" defaultValue={company.currency} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vat">
           <Card>
            <CardHeader>
              <CardTitle>VAT Configuration</CardTitle>
              <CardDescription>Manage your VAT registration status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                   <Label>VAT Registered?</Label>
                   <p className="text-sm text-muted-foreground">Enable VAT calculations and reporting.</p>
                </div>
                <Switch checked={company.vatRegistered} />
              </div>
              
              <div className="p-4 bg-muted/20 rounded-md text-sm">
                VAT Rates are currently hardcoded to 2025 Irish Revenue standards (23%, 13.5%, 9%, 0%).
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Reset your application data.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => {
                if (confirm("Are you sure you want to reset all data to the seed state? This cannot be undone.")) {
                   resetData();
                   window.location.reload();
                }
              }}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Seed Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
