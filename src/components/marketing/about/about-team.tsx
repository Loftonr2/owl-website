"use client";

/**
 * AboutTeam
 * ─────────
 * "THE OWL TEAM" section — two interactive cards with circular portraits.
 * Clicking any card (or its "Read Full Bio" button) opens an accessible
 * biography modal (TeamMemberModal).
 *
 * Design source: OWL Team.png (supplied approved asset)
 * Portrait images: larissa-portrait.png / rick-portrait.png (extracted
 * from OWL Team.png via Python crop script).
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
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

export function AboutTeam() {
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  // Refs for returning focus after modal close
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const getTriggerRef = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) triggerRefs.current.set(id, el);
    else triggerRefs.current.delete(id);
  };

  const openModal = (member: TeamMember) => setActiveMember(member);
  const closeModal = () => setActiveMember(null);

  const triggerRef = {
    current: activeMember ? (triggerRefs.current.get(activeMember.id) ?? null) : null,
  };

  return (
    <>
      <section
        aria-labelledby="owl-team-heading"
        className="bg-owl-cream"
      >
        {/* ── Approved section artwork ─────────────────────────────────────── */}
        <figure className="overflow-hidden">
          <Image
            src="/images/about/redesign/owl-team.png"
            alt="The OWL Team — Larissa Pola, Creator, CEO, and Founder; and Rick Lofton, COO, CTO, and Marketing Director."
            width={2061}
            height={763}
            className="w-full h-auto"
          />
        </figure>

        <div className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          {/* Eyebrow + heading */}
          <div className="mb-12 text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-owl-teal">
              THE OWL TEAM
            </p>
            <div className="mt-2 flex items-center justify-center gap-3" aria-hidden="true">
              <div className="h-px w-8 bg-owl-teal/50" />
              <svg width="12" height="11" viewBox="0 0 12 11" fill="currentColor" className="text-owl-teal">
                <path d="M6 10.2S1 6.8 1 3.9a2.5 2.5 0 015 0 2.5 2.5 0 015 0C11 6.8 6 10.2 6 10.2z" />
              </svg>
              <div className="h-px w-8 bg-owl-teal/50" />
            </div>
            <h2
              id="owl-team-heading"
              className="mt-4 font-display text-3xl font-extrabold text-owl-ink sm:text-4xl"
            >
              Meet the Heart Behind OWL
            </h2>
          </div>

          {/* Team cards grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {TEAM_MEMBERS.map((member) => (
              <article
                key={member.id}
                className={cn(
                  "group relative flex flex-col rounded-3xl bg-white p-8 shadow-owl-2",
                  "cursor-pointer transition-all duration-300 ease-owl",
                  "hover:-translate-y-1 hover:shadow-owl-3",
                  "focus-within:ring-2 focus-within:ring-owl-teal focus-within:ring-offset-2"
                )}
                onClick={() => openModal(member)}
              >
                <div className="flex items-start gap-6">
                  {/* Circular portrait */}
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-owl-teal/20 shadow-owl-1">
                    <Image
                      src={member.imageSrc}
                      alt={member.imageAlt}
                      fill
                      className="object-cover object-top"
                      sizes="112px"
                    />
                  </div>

                  {/* Name + role + short bio */}
                  <div className="flex-1 pt-1">
                    <h3 className="font-display text-xl font-extrabold text-owl-ink">
                      {member.name}
                    </h3>
                    <p className="mt-0.5 font-display text-sm font-semibold text-owl-teal">
                      {member.role}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-owl-ink/75">
                      {member.shortBio}
                    </p>
                  </div>
                </div>

                {/* Teal outline heart + Read Full Bio */}
                <div className="mt-6 flex items-center justify-between">
                  <Heart
                    className="h-5 w-5 text-owl-teal"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <button
                    ref={getTriggerRef(member.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(member);
                    }}
                    aria-label={`Read ${member.name}'s full biography`}
                    className={cn(
                      "rounded-full border-2 border-owl-teal px-5 py-2",
                      "font-display text-xs font-bold text-owl-teal",
                      "transition-all duration-150",
                      "hover:bg-owl-teal hover:text-white",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-owl-teal focus-visible:ring-offset-2"
                    )}
                  >
                    Read Full Bio
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* Accessible biography modal */}
      <TeamMemberModal
        member={activeMember}
        onClose={closeModal}
        triggerRef={triggerRef as React.RefObject<HTMLElement | null>}
      />
    </>
  );
}
