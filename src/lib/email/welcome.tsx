import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { siteConfig } from "@/lib/site-config";

/**
 * Welcome email — sent immediately on newsletter signup.
 * Day 0 of the 5-email welcome sequence per
 * ../../OWL-Obsidian-Brain/07_Blog_Newsletter/BLOG_NEWSLETTER_SYSTEM.md §2.
 *
 * Voice: warm, Mr. Rogers-style. No marketing-bro language. No exclamation
 * stacks. Always include the free printable pack link and the catchphrase.
 */
export default function WelcomeEmail({ firstName }: { firstName?: string } = {}) {
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
  const printableUrl = `${siteConfig.url}/printables/welcome-pack`;

  return (
    <Html>
      <Head />
      <Preview>Your free OWL printable pack is inside.</Preview>
      <Body style={{ backgroundColor: "#FBF6EC", fontFamily: "Nunito, sans-serif" }}>
        <Container style={{ padding: "32px 24px", maxWidth: 560 }}>
          <Heading style={{ color: "#1C2B4A", fontSize: 28, marginBottom: 16 }}>
            I&apos;m so glad you&apos;re here today.
          </Heading>

          <Text style={{ color: "#1C2B4A", fontSize: 16, lineHeight: 1.6 }}>
            {greeting}
          </Text>

          <Text style={{ color: "#1C2B4A", fontSize: 16, lineHeight: 1.6 }}>
            I&apos;m Larissa — and welcome to OWL Sing Together. Every week I&apos;ll send
            you one short note with a new video, a free printable, and a small,
            useful idea you can try with the kids in your life today.
          </Text>

          <Section style={{ margin: "24px 0", padding: 20, backgroundColor: "#FFFFFF", borderRadius: 16 }}>
            <Text style={{ color: "#1C2B4A", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
              Your free OWL ABC printable pack
            </Text>
            <Text style={{ color: "#7A8794", fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
              Three pages, multicultural illustrations, ready to print on regular
              paper. A gentle place to start.
            </Text>
            <Link
              href={printableUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#1A9994",
                color: "#FFFFFF",
                padding: "10px 18px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Download the printable pack
            </Link>
          </Section>

          <Text style={{ color: "#1C2B4A", fontSize: 16, lineHeight: 1.6 }}>
            See you Sunday for the first edition of The OWL Weekly.
          </Text>

          <Text style={{ color: "#7A8794", fontSize: 14, marginTop: 32 }}>
            With warmth,<br />Larissa
          </Text>

          <Text style={{ color: "#7A8794", fontSize: 12, marginTop: 32 }}>
            {siteConfig.name} · Las Vegas, NV
            <br />
            <Link href={`${siteConfig.url}/preferences`} style={{ color: "#7A8794" }}>
              Update preferences
            </Link>{" "}
            ·{" "}
            <Link href={`${siteConfig.url}/unsubscribe`} style={{ color: "#7A8794" }}>
              Unsubscribe
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
