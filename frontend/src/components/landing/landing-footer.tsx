import { Link } from "react-router-dom";

import { Logo } from "@/components/shared/logo";
import { APP_NAME, ROUTES, SUPPORT } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Produto",
    links: [
      { label: "Benefícios", href: "#beneficios" },
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Planos", href: "#planos" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "#" },
      { label: "Contato", href: `mailto:${SUPPORT.email}` },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "#" },
      { label: "Privacidade", href: "#" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Automações e assistentes inteligentes para o seu negócio, no WhatsApp e no
              seu painel.
            </p>
            <Link
              to={ROUTES.register}
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Começar grátis →
            </Link>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-sm font-semibold">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
