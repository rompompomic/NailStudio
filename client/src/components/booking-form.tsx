import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, Send } from "lucide-react";
import type { Service } from "@shared/schema";

const bookingSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  service: z.string().min(1, "Выберите услугу"),
  comment: z.string().optional(),
});

type BookingData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
}

export default function BookingForm({ isOpen, onClose, services }: BookingFormProps) {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingData>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedService = watch("service");

  const submitMutation = useMutation({
    mutationFn: async (data: BookingData) => {
      const response = await apiRequest("POST", "/api/requests", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      reset();
      toast({
        title: "Заявка отправлена!",
        description: "Я свяжусь с вами в ближайшее время.",
      });
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заявку. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingData) => {
    submitMutation.mutate(data);
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, "");
    if (phoneNumber.startsWith("7")) {
      const formatted = phoneNumber.substring(1);
      if (formatted.length >= 10) {
        return `+7 (${formatted.substring(0, 3)}) ${formatted.substring(3, 6)}-${formatted.substring(6, 8)}-${formatted.substring(8, 10)}`;
      }
    }
    return `+7 (${phoneNumber.substring(0, 3)}) ${phoneNumber.substring(3, 6)}-${phoneNumber.substring(6, 8)}-${phoneNumber.substring(8, 10)}`;
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Заявка отправлена!</h3>
            <p className="text-muted-foreground">Я свяжусь с вами в ближайшее время</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold text-foreground">Записаться на маникюр</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Ваше имя *
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Введите ваше имя"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">
              Телефон *
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="+7 (999) 123-45-67"
              className="mt-1"
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setValue("phone", formatted);
              }}
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="service" className="text-sm font-medium text-foreground">
              Желаемая услуга *
            </Label>
            <Select onValueChange={(value) => setValue("service", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Выберите услугу" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.name}>
                    {service.name} — {service.price}
                  </SelectItem>
                ))}
                <SelectItem value="consultation">Консультация</SelectItem>
                <SelectItem value="other">Другое</SelectItem>
              </SelectContent>
            </Select>
            {errors.service && (
              <p className="text-sm text-destructive mt-1">{errors.service.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="comment" className="text-sm font-medium text-foreground">
              Комментарий (по желанию)
            </Label>
            <Textarea
              id="comment"
              {...register("comment")}
              placeholder="Дополнительные пожелания или уточнения"
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                Отправляем...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Отправить заявку
              </>
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center">
          Отвечу в течение 30 минут в рабочее время
        </p>
      </DialogContent>
    </Dialog>
  );
}
