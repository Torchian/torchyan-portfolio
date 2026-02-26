'use client';

import styled from 'styled-components';
import { Container, Display, Button } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';

const Section = styled.section`
  padding: ${spacing[2000]}px 0;
  text-align: center;

  ${media.down('m')} {
    padding: ${spacing[1000]}px 0;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[600]}px;
`;

const CTAText = styled(Display)`
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.xxs}px;
  max-width: 1000px;

  ${media.down('m')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const CTAButton = styled(Button)`
  padding: 0 ${spacing[400]}px;
  height: ${spacing[600] + spacing[100]}px;
  font-size: ${fontSize.body.xl}px;
  border-radius: ${radius.round}px;
`;

export function ContactCTASection() {
  return (
    <Section id="contact">
      <Container>
        <Content>
          <CTAText $size="l">
            Let&apos;s talk about what you&apos;re building
          </CTAText>
          <CTAButton as="a" href="mailto:hello@torchyan.com" $variant="secondary">
            Get in Touch
          </CTAButton>
        </Content>
      </Container>
    </Section>
  );
}
