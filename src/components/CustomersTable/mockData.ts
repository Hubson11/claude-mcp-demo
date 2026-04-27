export type StatusEnum = 'active' | 'inactive';

export interface CustomersData {
  customer: string;
  company: string;
  phone: string;
  email: string;
  country: string;
  status: StatusEnum;
  createdAt: string; // ISO date string for sort
}

export const MOCK_CUSTOMERS: CustomersData[] = [
  { customer: 'Jane Cooper',          company: 'Microsoft', phone: '(225) 555-0118', email: 'jane@microsoft.com',    country: 'United States', status: 'active',   createdAt: '2024-03-15' },
  { customer: 'Floyd Miles',          company: 'Yahoo',     phone: '(205) 555-0100', email: 'floyd@yahoo.com',       country: 'Kiribati',      status: 'inactive', createdAt: '2024-03-10' },
  { customer: 'Ronald Richards',      company: 'Adobe',     phone: '(302) 555-0107', email: 'ronald@adobe.com',      country: 'Israel',        status: 'inactive', createdAt: '2024-03-08' },
  { customer: 'Marvin McKinney',      company: 'Tesla',     phone: '(252) 555-0126', email: 'marvin@tesla.com',      country: 'Iran',          status: 'active',   createdAt: '2024-03-05' },
  { customer: 'Jerome Bell',          company: 'Google',    phone: '(629) 555-0129', email: 'jerome@google.com',     country: 'Réunion',       status: 'active',   createdAt: '2024-02-28' },
  { customer: 'Kathryn Murphy',       company: 'Microsoft', phone: '(406) 555-0120', email: 'kathryn@microsoft.com', country: 'Curaçao',       status: 'active',   createdAt: '2024-02-20' },
  { customer: 'Jacob Jones',          company: 'Yahoo',     phone: '(208) 555-0112', email: 'jacob@yahoo.com',       country: 'Brazil',        status: 'active',   createdAt: '2024-02-15' },
  { customer: 'Kristin Watson',       company: 'Facebook',  phone: '(704) 555-0127', email: 'kristin@facebook.com',  country: 'Åland Islands', status: 'inactive', createdAt: '2024-02-10' },
  { customer: 'Leslie Alexander',     company: 'Apple',     phone: '(907) 555-0101', email: 'leslie@apple.com',      country: 'Canada',        status: 'active',   createdAt: '2024-02-05' },
  { customer: 'Jenny Wilson',         company: 'Netflix',   phone: '(316) 555-0116', email: 'jenny@netflix.com',     country: 'Germany',       status: 'active',   createdAt: '2024-01-30' },
  { customer: 'Guy Hawkins',          company: 'Amazon',    phone: '(603) 555-0123', email: 'guy@amazon.com',        country: 'France',        status: 'inactive', createdAt: '2024-01-25' },
  { customer: 'Cody Fisher',          company: 'Twitter',   phone: '(201) 555-0103', email: 'cody@twitter.com',      country: 'Japan',         status: 'active',   createdAt: '2024-01-20' },
  { customer: 'Savannah Nguyen',      company: 'Spotify',   phone: '(480) 555-0108', email: 'savannah@spotify.com',  country: 'Australia',     status: 'active',   createdAt: '2024-01-15' },
  { customer: 'Ralph Edwards',        company: 'Slack',     phone: '(770) 555-0155', email: 'ralph@slack.com',       country: 'India',         status: 'inactive', createdAt: '2024-01-10' },
  { customer: 'Brooklyn Simmons',     company: 'Uber',      phone: '(219) 555-0114', email: 'brooklyn@uber.com',     country: 'Mexico',        status: 'active',   createdAt: '2024-01-05' },
  { customer: 'Cameron Williamson',   company: 'Airbnb',    phone: '(702) 555-0122', email: 'cameron@airbnb.com',    country: 'Spain',         status: 'active',   createdAt: '2023-12-28' },
  { customer: 'Eleanor Pena',         company: 'Dropbox',   phone: '(603) 555-0199', email: 'eleanor@dropbox.com',   country: 'Italy',         status: 'inactive', createdAt: '2023-12-20' },
  { customer: 'Theresa Webb',         company: 'Zoom',      phone: '(312) 555-0131', email: 'theresa@zoom.com',      country: 'Netherlands',   status: 'active',   createdAt: '2023-12-15' },
  { customer: 'Annette Black',        company: 'Shopify',   phone: '(512) 555-0171', email: 'annette@shopify.com',   country: 'Sweden',        status: 'active',   createdAt: '2023-12-10' },
  { customer: 'Courtney Henry',       company: 'GitHub',    phone: '(907) 555-0177', email: 'courtney@github.com',   country: 'Denmark',       status: 'inactive', createdAt: '2023-12-05' },
];
