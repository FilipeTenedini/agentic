import { useState } from "react";
import { Clock, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FAQ_ITEMS } from "@/mocks/faq";
import { SUPPORT } from "@/lib/constants";

export function HelpPage() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSending(false);
    setMessage("");
    toast.success("Mensagem enviada! Retornaremos em breve.");
  }

  return (
    <PageContainer>
      <PageHeader
        title="Ajuda"
        description="Tire suas dúvidas ou fale com o nosso time de suporte."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perguntas frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-4" />
                </span>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${SUPPORT.email}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {SUPPORT.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="size-4" />
                </span>
                <div>
                  <p className="text-muted-foreground">Atendimento</p>
                  <p className="font-medium">{SUPPORT.hours}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="size-4" /> Enviar mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="support-message">Como podemos ajudar?</Label>
                <Textarea
                  id="support-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva sua dúvida ou problema..."
                  rows={4}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSend}
                loading={sending}
                disabled={!message.trim()}
              >
                Enviar mensagem
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
