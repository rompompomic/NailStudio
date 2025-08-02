import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";

interface AdminBlockCreatorProps {
  token: string;
}

export default function AdminBlockCreator({ token }: AdminBlockCreatorProps) {
  const [formData, setFormData] = useState({
    blockType: "",
    title: "",
    content: "",
    enabled: true,
    order: 0,
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createBlockMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/blocks", data, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blocks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blocks"] });
      toast({ title: "Успешно", description: "Блок создан" });
      setFormData({
        blockType: "",
        title: "",
        content: "",
        enabled: true,
        order: 0,
      });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось создать блок", variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!formData.blockType || !formData.title) {
      toast({ title: "Ошибка", description: "Заполните обязательные поля", variant: "destructive" });
      return;
    }
    createBlockMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Создать новый блок
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="blockType">Тип блока *</Label>
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, blockType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип блока" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="about">Обо мне</SelectItem>
              <SelectItem value="services">Услуги</SelectItem>
              <SelectItem value="reviews">Отзывы</SelectItem>
              <SelectItem value="contacts">Контакты</SelectItem>
              <SelectItem value="custom">Пользовательский</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title">Заголовок *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Введите заголовок блока"
          />
        </div>

        <div>
          <Label htmlFor="content">Содержимое</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Введите содержимое блока"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="order">Порядок</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
            placeholder="0"
          />
        </div>

        <Button 
          onClick={handleCreate}
          disabled={createBlockMutation.isPending}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          {createBlockMutation.isPending ? "Создание..." : "Создать блок"}
        </Button>
      </CardContent>
    </Card>
  );
} 