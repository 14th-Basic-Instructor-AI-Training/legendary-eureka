import { getMyAgencyProfile, getMyAgencyReviews } from "@/lib/api/profile";
import { apiProfileToAgencyProfile, apiReviewToProfileReview } from "@/features/agency/mappers";
import { AgencyProfileWorkspace } from "@/features/agency/components/AgencyProfileWorkspace";

export default async function AgencyProfilePage() {
  const [profileApi, reviewsPage] = await Promise.all([
    getMyAgencyProfile(),
    getMyAgencyReviews({ page: 0, size: 50 }),
  ]);

  return (
    <AgencyProfileWorkspace
      initialProfile={apiProfileToAgencyProfile(profileApi)}
      initialReviews={reviewsPage.content.map(apiReviewToProfileReview)}
    />
  );
}
