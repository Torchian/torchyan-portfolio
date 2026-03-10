import { Container } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { YearsMapSection } from '@/components/sections/years-map/YearsMapSection';
import { ContactCTASection } from '@/components/sections/contact-cta/ContactCTASection';
import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, fontFamily } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';

const Section = styled.section`
  padding: ${spacing[1000]}px 0;

  ${media.down('m')} {
    padding: ${spacing[500]}px 0;
  }
`;

const IntroText = styled.p`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  color: ${neutrals[100]};
  max-width: 640px;
`;

export const metadata = {
  title: 'About',
  description: 'About Stepan Torchyan — Designer × Engineer.',
};

export default function AboutPage() {
  return (
    <main id="main-content">
      <Section id="about">
        <Container>
          <SectionHeading
            title="About Me"
            subtitle="Designer × Engineer"
            $align="left"
          />
          <IntroText>
            I bridge design and engineering to build products that are both
            beautiful and robust. From San Francisco to Yerevan, I&apos;ve worked
            with teams worldwide to ship experiences that users love.
          </IntroText>
        </Container>
      </Section>
      <YearsMapSection />
      <ContactCTASection />
    </main>
  );
}
