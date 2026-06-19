import { ProfileForm } from "@/components/profile/profile-form";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";

export function ProfilePage() {
  return (
    <PageContainer>
      <PageHeader title="Perfil" description="Gerencie suas informações pessoais." />
      <ProfileForm />
    </PageContainer>
  );
}
