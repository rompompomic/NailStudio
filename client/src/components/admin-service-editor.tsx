import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, Upload, Trash2, Edit, X } from "lucide-react";
import type { Service } from "@shared/schema";

interface AdminServiceEditorProps {
  service: Service;
  token: string;
  onDelete?: () => void;
}

export default function AdminServiceEditor({ service, token, onDelete }: AdminServiceEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: service.name,
    description: service.description,
    price: service.price.replace(' ₽', ''), // Убираем ₽ для редактирования
    icon: service.icon || "💅",
    image: service.image || "",
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateServiceMutation = useMutation({
    mutationFn: async (data: Partial<Service>) => {
      const response = await apiRequest("PUT", `/api/admin/services/${service.id}`, data, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Успешно", description: "Услуга обновлена" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить услугу", variant: "destructive" });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/admin/services/${service.id}`, null, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Успешно", description: "Услуга удалена" });
      onDelete?.();
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось удалить услугу", variant: "destructive" });
    },
  });

  const handleSave = () => {
    const dataToSend = {
      ...formData,
      price: formData.price + " ₽", // Добавляем ₽ автоматически
    };
    updateServiceMutation.mutate(dataToSend);
  };

  const handleImageUpload = async (file: File) => {
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    
    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, image: result.path }));
        toast({ title: "Успешно", description: "Изображение загружено" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить изображение", variant: "destructive" });
    }
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Редактирование услуги</span>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleSave}
                disabled={updateServiceMutation.isPending}
                size="sm"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Сохранить
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`name-${service.id}`}>Название услуги</Label>
            <Input
              id={`name-${service.id}`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor={`description-${service.id}`}>Описание</Label>
            <Textarea
              id={`description-${service.id}`}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor={`price-${service.id}`}>Цена (₽)</Label>
            <Input
              id={`price-${service.id}`}
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="1500"
            />
          </div>

          <div>
            <Label htmlFor={`icon-${service.id}`}>Эмодзи</Label>
            <Input
              id={`icon-${service.id}`}
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="💅"
            />
          </div>

          <div>
            <Label>Изображение услуги</Label>
            <div className="flex items-center gap-4">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  id={`image-upload-${service.id}`}
                />
                <label htmlFor={`image-upload-${service.id}`}>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <span>
                      <Upload className="w-4 h-4" />
                      Загрузить
                    </span>
                  </Button>
                </label>
              </div>
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Service preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
            </div>
            <Input
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="URL изображения"
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {service.image ? (
              <img
                src={service.image}
                alt={service.name}
                className="w-16 h-16 object-cover rounded-xl"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-pastel rounded-xl flex items-center justify-center">
                <span className="text-2xl">{service.icon}</span>
              </div>
            )}
            <div>
              <h4 className="font-medium text-lg">{service.name}</h4>
              <p className="text-sm text-muted-foreground">{service.description}</p>
              <p className="text-lg font-semibold text-accent-foreground">{service.price}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => deleteServiceMutation.mutate()}
              disabled={deleteServiceMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 