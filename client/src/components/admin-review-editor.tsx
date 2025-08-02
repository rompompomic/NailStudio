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
import type { Review } from "@shared/schema";

interface AdminReviewEditorProps {
  review: Review;
  token: string;
  onDelete?: () => void;
}

export default function AdminReviewEditor({ review, token, onDelete }: AdminReviewEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: review.name,
    text: review.text,
    photo: review.photo || "",
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateReviewMutation = useMutation({
    mutationFn: async (data: Partial<Review>) => {
      const response = await apiRequest("PUT", `/api/admin/reviews/${review.id}`, data, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Успешно", description: "Отзыв обновлен" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить отзыв", variant: "destructive" });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/admin/reviews/${review.id}`, null, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Успешно", description: "Отзыв удален" });
      onDelete?.();
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось удалить отзыв", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateReviewMutation.mutate(formData);
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
        setFormData(prev => ({ ...prev, photo: result.path }));
        toast({ title: "Успешно", description: "Фото загружено" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить фото", variant: "destructive" });
    }
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Редактирование отзыва</span>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleSave}
                disabled={updateReviewMutation.isPending}
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
            <Label htmlFor={`name-${review.id}`}>Имя клиента</Label>
            <Input
              id={`name-${review.id}`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor={`text-${review.id}`}>Текст отзыва</Label>
            <Textarea
              id={`text-${review.id}`}
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              rows={4}
            />
          </div>

          <div>
            <Label>Фото клиента</Label>
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
                  id={`photo-upload-${review.id}`}
                />
                <label htmlFor={`photo-upload-${review.id}`}>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <span>
                      <Upload className="w-4 h-4" />
                      Загрузить
                    </span>
                  </Button>
                </label>
              </div>
              {formData.photo && (
                <img
                  src={formData.photo}
                  alt="Review photo"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
            </div>
            <Input
              value={formData.photo}
              onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
              placeholder="URL фото"
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
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <img 
              src={review.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=f0f0f0&color=666`}
              alt={review.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{review.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">Клиентка</p>
              <p className="text-muted-foreground leading-relaxed">
                "{review.text}"
              </p>
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
              onClick={() => deleteReviewMutation.mutate()}
              disabled={deleteReviewMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 