import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { integrationService } from "@/services/integrationService";
import { IntegrationForm } from "./IntegrationForm";
import { IntegrationsList } from "./IntegrationsList";
import type { Integration, CreateIntegrationData } from "@/types/integration";

interface IntegrationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntegrationsDialog({ open, onOpenChange }: IntegrationsDialogProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [currentView, setCurrentView] = useState<"list" | "form">("list");
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadIntegrations();
    }
  }, [open]);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const data = await integrationService.getIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error("Failed to load integrations:", error);
      toast({
        title: "Error",
        description: "Failed to load integrations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingIntegration(null);
    setCurrentView("form");
  };

  const handleEdit = (integration: Integration) => {
    setEditingIntegration(integration);
    setCurrentView("form");
  };

  const handleSubmit = async (data: CreateIntegrationData) => {
    try {
      setIsLoading(true);
      
      if (editingIntegration) {
        await integrationService.updateIntegration(editingIntegration.id, data);
        toast({
          title: "Success",
          description: "Integration updated successfully.",
        });
      } else {
        await integrationService.createIntegration(data);
        toast({
          title: "Success",
          description: "Integration created successfully.",
        });
      }
      
      await loadIntegrations();
      setCurrentView("list");
      setEditingIntegration(null);
    } catch (error) {
      console.error("Failed to save integration:", error);
      toast({
        title: "Error",
        description: "Failed to save integration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await integrationService.deleteIntegration(id);
      toast({
        title: "Success",
        description: "Integration deleted successfully.",
      });
      await loadIntegrations();
    } catch (error) {
      console.error("Failed to delete integration:", error);
      toast({
        title: "Error",
        description: "Failed to delete integration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentView("list");
    setEditingIntegration(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentView === "form" 
              ? (editingIntegration ? "Edit Integration" : "Add Integration")
              : "Manage Integrations"
            }
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {currentView === "list" ? (
            <IntegrationsList
              integrations={integrations}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
              isLoading={isLoading}
            />
          ) : (
            <IntegrationForm
              integration={editingIntegration || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}