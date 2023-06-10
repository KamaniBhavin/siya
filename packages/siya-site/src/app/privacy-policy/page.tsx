import BackgroundCircles from '@/app/background_circles';

export default function PrivacyPolicyPage() {
  return (
    <div className="text-siya-blue flex flex-col gap-2 p-4 lg:flex-row lg:gap-16 lg:p-16">
      <BackgroundCircles />
      <div className="flex flex-col items-start gap-2 lg:items-center">
        <h3 className="text-lg font-bold lg:text-3xl">Table of Content</h3>
        <div className="flex flex-col items-start gap-4">
          <ol className="list-inside list-decimal font-semibold text-gray-700">
            <li className="text-sm tracking-tight lg:text-lg">
              <a href="#information-collection-and-use">
                Information Collection and Use
              </a>
            </li>
            <li className="text-sm tracking-tight lg:text-lg">
              <a href="#log-data">Data Logging</a>
            </li>
            <li className="text-sm tracking-tight lg:text-lg">
              <a href="#cookies">Cookies</a>
            </li>
            <li className="text-sm tracking-tight lg:text-lg">
              <a href="#service-providers">Service Providers</a>
            </li>
            <li className="text-sm tracking-tight lg:text-lg">
              <a href="#security">Security</a>
            </li>
            <li className="text-sm tracking-tight lg:text-lg">
              <a href="#links-to-other-sites">Links to Other Sites</a>
            </li>
            <li className="text-sm tracking-tight lg:text-lg">
              <a href="#childrens-privacy">Children’s Privacy</a>
            </li>
            <li className="text-sm tracking-tight lg:text-lg">
              <a href="#changes-to-this-privacy-policy">
                Changes to This Privacy Policy
              </a>
            </li>
            <li className="text-sm tracking-tight lg:text-lg">
              <a href="#contact-us">Contact Us</a>
            </li>
          </ol>
        </div>
      </div>
      <div className="flex flex-col gap-8 lg:w-2/3">
        <h3
          id={'information-collection-and-use'}
          className="border-siya-yellow border-b-4 text-lg font-bold lg:text-3xl">
          Information Collection and Use
        </h3>
        <p className="text-sm tracking-tight lg:text-lg">
          For a better experience, while using our Service, we may require you
          to provide us with certain personally identifiable information,
          including but not limited to Name, Email, Phone Number, Address. The
          information that we request will be retained by us and used as
          described in this privacy policy.
        </p>
        <p className="text-sm tracking-tight lg:text-lg">
          The app does use third party services that may collect information
          used to identify you.
        </p>
        <h3
          id={'log-data'}
          className="border-siya-yellow border-b-4 text-lg  font-bold lg:text-3xl">
          Data Logging
        </h3>
        <p className="text-sm tracking-tight lg:text-lg">
          We want to inform you that whenever you use our Service, in a case of
          an error in the app we collect data and information (through third
          party products) using Sentry. This data log may include information
          such as your device Internet Protocol (“IP”) address, device name,
          operating system version, the configuration of the app when utilizing
          our Service, the time and date of your use of the Service, and other
          statistics.
        </p>
        <h3
          id={'cookies'}
          className="border-siya-yellow border-b-4 text-lg  font-bold lg:text-3xl">
          Cookies
        </h3>
        <p className="text-sm tracking-tight lg:text-lg">
          Cookies are files with a small amount of data that are commonly used
          as anonymous unique identifiers. These are sent to your browser from
          the websites that you visit and are stored on your devices internal
          memory.
        </p>
        <p className="text-sm tracking-tight lg:text-lg">
          A Slack bot does not utilize cookies directly since it doesn&apos;t operate
          within a browser environment. However, it may incorporate third-party
          code and libraries that employ cookies to gather information and
          enhance their services. You have the choice to accept or decline these
          cookies and be informed when a cookie is being transmitted to your
          device. Please note that declining cookies may limit your ability to
          access certain features or functionalities of this Slack bot.
        </p>
        <h3
          id={'service-providers'}
          className="border-siya-yellow border-b-4 text-lg  font-bold lg:text-3xl">
          Service Providers
        </h3>
        <p className="text-sm tracking-tight lg:text-lg">
          We may employ third-party companies and individuals due to the
          following reasons:
        </p>
        <ul className="list-inside list-disc font-semibold">
          <li className="text-sm tracking-tight lg:text-lg">
            To facilitate our Service;
          </li>
          <li className="text-sm tracking-tight lg:text-lg">
            To provide the Service on our behalf;
          </li>
          <li className="text-sm tracking-tight lg:text-lg">
            To perform Service-related services; or
          </li>
          <li className="text-sm tracking-tight lg:text-lg">
            To assist us in analyzing how our Service is used.
          </li>
        </ul>
        <p className="text-sm tracking-tight lg:text-lg">
          We want to inform users of this Service that these third parties have
          access to your Personal Information. The reason is to perform the
          tasks assigned to them on our behalf. However, they are obligated not
          to disclose or use the information for any other purpose.
        </p>
        <h3
          id={'security'}
          className="border-siya-yellow border-b-4 text-lg  font-bold lg:text-3xl">
          Security
        </h3>
        <p className="text-sm tracking-tight lg:text-lg">
          We value your trust in providing us your Personal Information, thus we
          are striving to use commercially acceptable means of protecting it.
          But remember that no method of transmission over the internet, or
          method of electronic storage is 100% secure and reliable, and we
          cannot guarantee its absolute security.
        </p>
        <h3
          id={'links-to-other-sites'}
          className="border-siya-yellow border-b-4 text-lg  font-bold lg:text-3xl">
          Links to Other Sites
        </h3>
        <p className="text-sm tracking-tight lg:text-lg">
          This Service may contain links to other sites. If you click on a
          third-party link, you will be directed to that site. Note that these
          external sites are not operated by us. Therefore, we strongly advise
          you to review the Privacy Policy of these websites. We have no control
          over and assume no responsibility for the content, privacy policies,
          or practices of any third-party sites or services.
        </p>
        <h3
          id={'childrens-privacy'}
          className="border-siya-yellow border-b-4 text-lg  font-bold lg:text-3xl">
          Children’s Privacy
        </h3>
        <p className="text-sm tracking-tight lg:text-lg">
          These Services do not address anyone under the age of 13. We do not
          knowingly collect personally identifiable information from children
          under 13. In the case we discover that a child under 13 has provided
          us with personal information, we immediately delete this from our
          servers. If you are a parent or guardian and you are aware that your
          child has provided us with personal information, please contact us so
          that we will be able to do necessary actions.
        </p>
        <h3
          id={'changes-to-this-privacy-policy'}
          className="border-siya-yellow border-b-4 text-lg  font-bold lg:text-3xl">
          Changes to This Privacy Policy
        </h3>
        <p className="text-sm tracking-tight lg:text-lg">
          We may update our Privacy Policy from time to time. Thus, you are
          advised to review this page periodically for any changes. We will
          notify you of any changes by posting the new Privacy Policy on this
          page.
        </p>
        <p className="text-sm tracking-tight lg:text-lg">
          This policy is effective from 2023-01-01
        </p>
        <h3
          id={'contact-us'}
          className="border-siya-yellow border-b-4 text-lg  font-bold lg:text-3xl">
          Contact Us
        </h3>
        <p className="text-sm tracking-tight lg:text-lg">
          If you have any questions or suggestions about our Privacy Policy, do
          not hesitate to contact us at
          <a
            href="mailto:hey@bhavinkamani.com"
            className="text-siya-yellow hover:text-siya-blue">
            {' '}
            hey@bhavinkamani.com.
          </a>
        </p>
      </div>
    </div>
  );
}
