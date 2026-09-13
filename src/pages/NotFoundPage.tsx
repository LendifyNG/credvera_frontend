import PageHero from '../components/layout/PageHero';
import ButtonLink from '../components/ui/ButtonLink';

export default function NotFoundPage() {
  return (
    <PageHero eyebrow="404" title="This page took a wrong turn." intro="The page you’re looking for doesn’t exist or has moved.">
      <div className="mt-10">
        <ButtonLink to="/">Back to home</ButtonLink>
      </div>
    </PageHero>
  );
}
