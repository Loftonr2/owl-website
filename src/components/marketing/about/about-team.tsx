"use client";

/**
 * AboutTeam
 * ─────────
 * "THE OWL TEAM" section.
 *
 * Displays the approved owl-team.png artwork as the sole visual.
 * Two minimal buttons beneath the artwork open full biography modals for
 * Larissa Pola and Rick Lofton. No card grid is rendered — the approved
 * image IS the visual design.
 *
 * Image sizing: 65% desktop · 82% tablet · 94% mobile (centred)
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { TeamMemberModal, type TeamMember } from "./team-member-modal";

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "larissa",
    name: "Larissa Pola",
    role: "Creator, CEO, and Founder",
    shortBio:
      "Larissa is a passionate storyteller, music lover, and lifelong advocate for children and families.",
    imageSrc: "/images/about/redesign/larissa-portrait.png",
    imageAlt: "Larissa Pola, Creator, CEO, and Founder of OWL Sing Together",
    fullBio: (
      <>
        <p>
          Larissa Pola brings a strong and deeply practical background in special education,
          shaped by years of service across multiple school systems and student populations.
          As a full time Special Education Teacher with the Clark County School District since
          2016, and through prior teaching roles in Los Angeles County and Oxnard, she has
          developed extensive experience supporting students with diverse academic, behavioral,
          and developmental needs.
        </p>
        <p>
          Her credentials in Mild to Moderate and Moderate to Severe special education, along
          with her Master of Science in Special Education, reflect both her formal training and
          her commitment to serving students who require individualized support. Her work in
          probation camps and juvenile detention settings also demonstrates resilience,
          adaptability, and the ability to build trust and provide structure in challenging
          educational environments.
        </p>
        <p>
          In addition to her classroom expertise, Larissa shows strong advocacy, leadership,
          and communication skills. Her experience advocating for students under the ADA
          highlights her commitment to educational equity and ensuring students receive the
          accommodations and protections they need to succeed. She also brings strengths in
          public speaking and staff development, suggesting she is effective not only in direct
          student support but also in collaborating with colleagues, families, and school teams.
        </p>
        <p>
          Her background in Peace and Conflict Studies and Victim Offender Reconciliation
          Program training adds another layer to her skill set, supporting her ability to
          navigate sensitive situations with empathy, professionalism, and a solution-focused
          mindset.
        </p>
      </>
    ),
  },
  {
    id: "rick",
    name: "Rick Lofton",
    role: "COO, CTO, and Marketing Director",
    shortBio:
      "Rick brings visionary leadership and creative strategy to connect OWL's mission with families around the world.",
    imageSrc: "/images/about/redesign/rick-portrait.png",
    imageAlt: "Rick Lofton, COO, CTO, and Marketing Director of OWL Sing Together",
    fullBio: (
      <>
        <p>
          Rick Lofton is a multidisciplinary business consultant specializing in web design,
          animation, and software development. He helps businesses and creative brands transform
          ideas into polished digital products, combining strategic planning with hands-on
          knowledge of branding, user experience, interactive media, and technology.
        </p>
        <p>
          His ability to connect creative direction with practical business goals allows him to
          develop websites, platforms, visual experiences, and software solutions designed to
          engage audiences and support long-term growth.
        </p>
        <p>
          Beyond consulting, Rick is an accomplished songwriter and producer who operates his
          independent record label, Quill Productions. He is also an author and publishing
          entrepreneur with his own publishing house, where he develops original intellectual
          property across multiple franchises, including 7 Colonies, The Last Makaran, and
          Indecent Proposal.
        </p>
        <p>
          His experience across music, publishing, entertainment, and technology gives him a
          distinctive perspective on building brands, protecting creative visions, and expanding
          stories into scalable multimedia businesses.
        </p>
      </>
    ),
  },
];

// ── Main section ──────────────────────────────────────────────────────────────

export function AboutTeam() {
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const getTriggerRef = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) triggerRefs.current.set(id, el);
    else triggerRefs.current.delete(id);
  };

  const openModal = (member: TeamMember) => setActiveMember(member);
  const closeModal = () => setActiveMember(null);

  const triggerRef = {
    current: activeMember ? (triggerRefs.current.get(activeMember.id) ?? null) : null,
  } as React.RefObject<HTMLElement | null>;

  return (
    <>
      <section
        aria-labelledby="owl-team-heading"
        className="bg-owl-cream py-10 md:py-14"
      >
        <h2 id="owl-team-heading" className="sr-only">
          Meet the Heart Behind OWL
        </h2>

        {/* ── Approved section artwork — 65% desktop · 82% tablet · 94% mobile ── */}
        <div className="mx-auto w-[94%] sm:w-[82%] lg:w-[65%]">
          <figure className="overflow-hidden rounded-3xl shadow-owl-2">
            <Image
              src="/images/about/redesign/owl-team.png"
              alt="The OWL Team — Larissa Pola, Creator, CEO, and Founder; and Rick Lofton, COO, CTO, and Marketing Director."
              width={2061}
              height={763}
              className="w-full h-auto"
            />
          </figure>
        </div>

        {/* ── Two accessible biography triggers — no card recreation ── */}
        <div className="mx-auto mt-8 w-[94%] sm:w-[82%] lg:w-[65%]">
          <p className="mb-4 text-center font-display text-xs font-bold uppercase tracking-[0.2em] text-owl-teal/80">
            Read their full biographies
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {TEAM_MEMBERS.map((member) => (
              <button
                key={member.id}
                ref={getTriggerRef(member.id)}
                type="button"
                onClick={() => openModal(member)}
                aria-label={`Read ${member.name}'s full biography`}
                className={cn(
                  "rounded-full bg-owl-teal px-6 py-2.5",
                  "font-display text-sm font-bold text-white",
                  "transition-all duration-150 hover:bg-owl-teal-deep",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-owl-teal focus-visible:ring-offset-2"
                )}
              >
                {member.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Accessible biography modal */}
      <TeamMemberModal
        member={activeMember}
        onClose={closeModal}
        triggerRef={triggerRef}
      />
    </>
  );
}
