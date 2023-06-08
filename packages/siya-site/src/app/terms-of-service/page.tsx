import BackgroundCircles from '@/app/background_circles';

export default function TermsOfServicePage() {
  return (
    <div className="text-siya-blue -z-10 mx-auto flex flex-col gap-8 p-8 lg:w-2/3">
      <BackgroundCircles />
      <h1 className="text-siya-yellow text-3xl font-bold lg:text-5xl">
        Terms of Service
      </h1>
      <h2 className="text-siya-blue border-siya-yellow border-l-4 pl-2 text-lg font-bold lg:text-2xl">
        Last revised on January 1, 2023
      </h2>
      <div className="text-siya-blue flex flex-col gap-4 text-sm tracking-tight lg:text-lg">
        <p>
          SIYA is a free to use slack bot. Any data that you provide to SIYA is
          not sold to any third party. We do not use your data for any purpose
          other than to provide you with the service that you have signed up
          for.
        </p>
        <p>
          By using Our Products, you agree to be bound by these Terms of
          Services, all applicable laws and regulations, and agree that you are
          responsible for compliance with any applicable local laws. If you do
          not agree with any of these terms, you are prohibited from using or
          accessing Our Products. The materials contained in Our Products are
          protected by applicable copyright and trademark law.
        </p>

        <h2 className="text-siya-blue border-siya-yellow border-l-4 pl-2 text-lg font-bold lg:text-2xl">
          Use License
        </h2>
        <p>
          Permission is granted to temporarily download one copy of the
          materials (information or software) on SIYA&apos;s website for personal,
          non-commercial transitory viewing only. This is the grant of a
          license, not a transfer of title, and under this license you may not:
        </p>

        <h2 className="text-siya-blue border-siya-yellow border-l-4 pl-2 text-lg font-bold lg:text-2xl">
          Disclaimer
        </h2>
        <p>
          The materials on SIYA&apos;s website are provided on an &apos;as is&apos; basis. SIYA
          makes no warranties, expressed or implied, and hereby disclaims and
          negates all other warranties including, without limitation, implied
          warranties or conditions of merchantability, fitness for a particular
          purpose, or non-infringement of intellectual property or other
          violation of rights.
        </p>
        <p>
          Further, SIYA does not warrant or make any representations concerning
          the accuracy, likely results, or reliability of the use of the
          materials on its website or otherwise relating to such materials or on
          any sites linked to this site.
        </p>

        <h2 className="text-siya-blue border-siya-yellow border-l-4 pl-2 text-lg font-bold lg:text-2xl">
          Limitations
        </h2>
        <p>
          In no event shall SIYA or its suppliers be liable for any damages
          (including, without limitation, damages for loss of data or profit, or
          due to business interruption) arising out of the use or inability to
          use the materials on SIYA&apos;s website, even if SIYA or a SIYA authorized
          representative has been notified orally or in writing of the
          possibility of such damage. Because some jurisdictions do not allow
          limitations on implied warranties, or limitations of liability for
          consequential or incidental damages, these limitations may not apply
          to you.
        </p>

        <h2 className="text-siya-blue border-siya-yellow border-l-4 pl-2 text-lg font-bold lg:text-2xl">
          Revision and Errata
        </h2>
        <p>
          The materials appearing on SIYA&apos;s website could include technical,
          typographical, or photographic errors. SIYA does not warrant that any
          of the materials on its website are accurate, complete or current.
          SIYA may make changes to the materials contained on its website at any
          time without notice. However SIYA does not make any commitment to
          update the materials.
        </p>

        <h2 className="text-siya-blue border-siya-yellow border-l-4 pl-2 text-lg font-bold lg:text-2xl">
          Links
        </h2>
        <p>
          SIYA has not reviewed all of the sites linked to its website and is
          not responsible for the contents of any such linked site. The
          inclusion of any link does not imply endorsement by SIYA of the site.
          Use of any such linked website is at the user&apos;s own risk.
        </p>

        <h2 className="text-siya-blue border-siya-yellow border-l-4 pl-2 text-lg font-bold lg:text-2xl">
          Modifications
        </h2>
        <p>
          SIYA may revise these terms of service for its website at any time
          without notice. By using this website you are agreeing to be bound by
          the then current version of these terms of service.
        </p>
      </div>
    </div>
  );
}
