import { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@components/Layout';
import Container from '@components/Container';
import Map from '@components/Map';
import Button from '@components/Button';
import PersonCard from '@components/Card/PersonCard';
import styles from '@styles/Home.module.scss';
import { icon } from '@fortawesome/fontawesome-svg-core'; 
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChessQueen, faChessPawn, faChessKnight, faChessRook, faUsers, faSatelliteDish, faPeopleGroup, faLandmarkDome, faTents, faChessKing } from '@fortawesome/free-solid-svg-icons';

// Add icons to the FontAwesome library
library.add(faChessQueen, faChessPawn, faChessKnight, faChessRook, faUsers, faSatelliteDish, faPeopleGroup, faLandmarkDome,faTents, faChessKing);

// Get app title from environment variables
const appTitle = process.env.NEXT_PUBLIC_APP_TITLE;

// Default center for the map
const DEFAULT_CENTER = process.env.NEXT_PUBLIC_DEFAULT_CENTER.split(',').map(parseFloat);

// Function to generate a DivIcon based on the person's type and organization
const getIcon = (person, orgName) => {

  // List of organizations and their corresponding icon classes
  const organizationsData = [
    { name: 'AfD', type: 'party', icon: 'fas fa-chess-pawn' },
    { name: 'III_Weg', type: 'party', icon: 'fas fa-chess-pawn' },
    { name: 'WU', type: 'party', icon: 'fas fa-chess-pawn' },
    { name: 'Media', type: 'organization', icon: 'fas fa-chess-pawn' },
    { name: 'Fraternities', type: 'association', icon: 'fas fa-chess-pawn' },
    { name: 'Associations', type: 'association', icon: 'fas fa-chess-pawn' },
    { name: 'Settlers', type: 'association', icon: 'fas fa-chess-pawn' },
  ];

  // Generate the correct HTML for the icon based on the person's type
  let iconHtml;
  switch (person.type) {
    case 'federal':
      iconHtml = icon({ prefix: 'fas', iconName: 'chess-queen' }).html;
      break;
    case 'state':
      iconHtml = icon({ prefix: 'fas', iconName: 'chess-rook' }).html;
      break;
    case 'district':
      iconHtml = icon({ prefix: 'fas', iconName: 'chess-knight' }).html;
      break;
    case 'entity':
      switch (orgName) {
        case organizationsData[3].name:
          iconHtml = icon({ prefix: 'fas', iconName: 'satellite-dish' }).html;
          break;
        case organizationsData[4].name:
          iconHtml = icon({ prefix: 'fas', iconName: 'people-group' }).html;
          break;
        case organizationsData[5].name:
          iconHtml = icon({ prefix: 'fas', iconName: 'landmark-dome' }).html;
          break;
        case organizationsData[6].name:
          iconHtml = icon({ prefix: 'fas', iconName: 'tents' }).html;
          break;
      }
  }

  // Return a new DivIcon with the generated HTML and necessary options
  return new L.DivIcon({
    className: `${person.type} 
                ${orgName.toLowerCase()} 
                invert
                flex
                bg-primary`,
    iconSize: [21, 21],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
    html: iconHtml,
  });
};

export default function Home() {
  // State variables
  const [visibleParties, setVisibleParties] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [socialMedia, setSocialMedia] = useState([]);

  // Fetch data from API routes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [organizationsRes, personsRes, locationsRes, socialMediaRes] = await Promise.all([
          fetch('/api/organization').then((res) => res.json()),
          fetch('/api/person').then((res) => res.json()),
          fetch('/api/location').then((res) => res.json()),
          fetch('/api/socialmedia').then((res) => res.json()),
        ]);

        // Set organizations and initialize visibleParties
        setOrganizations(organizationsRes);
        setVisibleParties(
          organizationsRes.reduce((acc, org) => {
            acc[org.name] = true; // Initialize all organizations as visible
            return acc;
          }, {})
        );

        // Map locations by person_id
        const locationsMap = locationsRes.reduce((acc, location) => {
          acc[location.person_id] = [location.lat, location.lon];
          return acc;
        }, {});

        // Map social media by person_id
        const socialMediaMap = socialMediaRes.reduce((acc, sm) => {
          if (!acc[sm.person_id]) {
            acc[sm.person_id] = [];
          }
          acc[sm.person_id].push({ type: sm.type, url: sm.url });
          return acc;
        }, {});

        // Combine persons with their organizations
        const personsWithOrganizations = personsRes.map((person) => {
          const organization = organizationsRes.find(org => org.id === person.organization_id);
          return { ...person, organization };
        });

        setLocations(locationsMap);
        setSocialMedia(socialMediaMap);
        setCandidates(personsWithOrganizations);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    
  }, []);

  // Filter candidates based on the search query dynamically
  const filteredCandidates = candidates.filter(person => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    // Iterate through all fields of the candidate object
    return Object.entries(person).some(([key, value]) => {
      if (value) {
        if (typeof value === 'string' || typeof value === 'number') {
          // Convert value to string and compare with the search query
          return value.toString().toLowerCase().includes(lowerSearchQuery);
        } else if (Array.isArray(value)) {
          // If the field is an array (like social media), check its contents
          return value.some(item => 
            typeof item === 'object'
              ? Object.values(item).some(v => v.toString().toLowerCase().includes(lowerSearchQuery))
              : item.toString().toLowerCase().includes(lowerSearchQuery)
          );
        }
      }
      return false;
    });
  });

  // Function to toggle organization visibility
  const toggleParty = (orgName) => {
    setVisibleParties((prevState) => ({
      ...prevState,
      [orgName]: !prevState[orgName],
    }));
  };

  // Render the home page
  return (
    <Layout>
      <Head>
        <title>{appTitle}</title>
        <meta name="description" content="Overview of politicians and their corresponding electoral districts." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.header}>
        <div className={styles.logo}>
            <svg
              version="1.1"
              width="42px"
              height="42px"
              viewBox="0 0 130 130">
                <g
                  id="g2">
                  <path
                  fill='#ffffff'
                    d="M 0,65.5 C 0,14 0,14 65,14 c 65,0 65,0 65,51.5 C 130,117 130,117 65,117 0,117 0,117 0,65.5 Z m 114.62417,37.43989 c 12.18129,-5.896863 10.60488,-18.268191 -3.13426,-24.596904 -5.45849,-2.514364 -5.7402,-2.791501 -3.17527,-3.12373 1.54804,-0.200516 3.88239,0.335048 5.18743,1.190143 2.44611,1.602752 10.09964,-4.924739 9.21476,-7.859017 C 122.06039,66.373628 113.57472,63 108.75599,63 c -18.127868,0 -23.007707,18.05417 -6.82347,25.245125 3.83528,1.704087 6.74289,3.471061 6.46134,3.926608 -0.92647,1.499066 -5.07771,0.864794 -7.66622,-1.171331 -2.542076,-1.999598 -2.542076,-1.999598 -6.682526,2.945714 -4.140449,4.945312 -4.140449,4.945312 -1.583701,6.620554 7.125285,4.66867 15.556097,5.57145 22.162757,2.37322 z M 23.184681,95 C 22.869363,86.5 22.869363,86.5 27.691542,95 37.875197,112.95061 46.439584,107.90075 46.77114,83.75 47.04228,64 47.04228,64 40.131801,64 c -6.910479,0 -6.910479,0 -6.389056,8.75 0.596522,10.01023 0.361935,9.986914 -5.229313,-0.51974 C 19.193338,54.716638 10,60.208409 10,83.289524 10,105.4451 9.5381304,104.17554 17.45896,103.79229 23.5,103.5 23.5,103.5 23.184681,95 Z M 86,98 c 0,-6 0,-6 -7,-6 -3.85,0 -7,-0.263288 -7,-0.585085 0,-0.321797 3.15,-4.427152 7,-9.123012 C 91.456924,67.098144 90.017259,64 70.5,64 53.345133,64 44.421584,75.373102 60.92586,76.202283 66.85172,76.5 66.85172,76.5 60.42586,84.330146 48.012131,99.45673 50.223531,104 70,104 c 16,0 16,0 16,-6 z M 73.5,59.136516 c 6.708624,-3.051685 6.926363,-3.97515 2.32856,-9.875827 -3.463672,-4.445169 -4.243661,-4.988445 -5.441797,-3.790309 -4.505437,4.505436 -10.680552,1.600104 -11.191582,-5.265531 -0.507086,-6.812638 5.167172,-10.441057 10.49369,-6.710219 2.36564,1.656959 11.291677,-7.099054 9.761257,-9.575324 C 75.456618,17.45767 57.317462,17.691798 50.131729,24.297728 33.106072,39.949615 52.410567,68.729887 73.5,59.136516 Z M 24,53.5 C 24,47 24,47 29.5,47 35,47 35,47 35,41 35,35 35,35 29.5,35 25.277778,35 24,34.651515 24,33.5 24,32.320513 25.388889,32 30.5,32 37,32 37,32 37,26 37,20 37,20 23.5,20 11.708081,20 1.7756349,50.442302 10.666667,59.333333 14.876111,63.542778 24,59.551076 24,53.5 Z m 76.20431,-0.214338 c 0.29569,-6.714338 0.29569,-6.714338 4.66315,0 C 109.23492,60 109.23492,60 117.7007,60 c 9.09689,0 9.145,0.184214 -5.00662,-19.170446 -1.95256,-2.670446 -1.95256,-2.670446 4.35403,-10.5 C 120.51674,26.023299 123.78,21.9375 124.2998,21.25 125.03687,20.275133 123.46467,20 117.1569,20 c -8.08799,0 -8.08799,0 -12.37244,6.086268 -4.28446,6.086267 -4.28446,6.086267 -4.58218,0 C 99.904565,20 99.904565,20 92.952283,20 c -6.144198,0 -11.583235,34.035715 -6.285616,39.333333 4.246328,4.246328 13.261672,0.218904 13.537643,-6.047671 z"
                    id="path4" />
                  <path
                    d="m 98.759081,103.63675 c -8.953167,-3.33826 -9.349803,-4.153637 -4.713967,-9.690634 4.14045,-4.945312 4.14045,-4.945312 6.682526,-2.945714 2.64959,2.084168 8.70178,2.787862 8.08588,0.940153 -0.19423,-0.582695 -3.04423,-2.14745 -6.33334,-3.477234 C 86.089833,81.836701 90.732412,63 108.75599,63 c 4.81873,0 13.3044,3.373628 13.96084,5.550382 0.56429,1.871183 -6.79735,9.627678 -8.10644,8.541236 -2.16742,-1.798797 -6.26423,-2.923588 -7.61282,-2.090117 -0.92498,0.571669 0.66909,1.734289 5.18601,3.782357 19.70106,8.932888 6.99017,32.464682 -13.424499,24.852892 z M 11,84 c 0,-24.871218 7.749177,-29.513869 17.943121,-10.75 5.025295,9.25 5.025295,9.25 5.041087,0 C 34,64 34,64 40,64 c 6,0 6,0 6,20.04569 C 46,108.42115 38.234223,113.11394 27.872454,95 23.010176,86.5 23.010176,86.5 23.005088,95.25 23,104 23,104 17,104 c -6,0 -6,0 -6,-20 z m 43,14.134103 c 0,-5.73207 0.147021,-6.045768 6.444239,-13.75 C 66.888477,76.5 66.888477,76.5 60.944239,76.202283 44.423534,75.374842 53.331316,64 70.5,64 c 19.517259,0 20.956924,3.098144 8.5,18.291903 -3.85,4.69586 -7,8.801215 -7,9.123012 C 72,91.736712 75.15,92 79,92 c 7,0 7,0 7,6 0,6 0,6 -16,6 -16,0 -16,0 -16,-5.865897 z M 55.314369,58.566058 C 40.012143,51.441419 40.10243,27.855017 55.45863,20.879664 c 7.022035,-3.189668 21.205283,-1.468549 23.905773,2.900936 1.751204,2.833507 -7.336299,11.142509 -10.316093,9.432342 -8.566756,-4.916643 -14.826501,7.153135 -6.806515,13.124035 2.664165,1.983477 2.846496,1.991345 6.439676,0.277877 4.106068,-1.958048 3.51542,-2.306789 9.320907,5.50342 4.980252,6.700009 -11.864471,11.487169 -22.688009,6.447784 z M 11,40 c 0,-20 0,-20 13,-20 13,0 13,0 13,6 0,6 0,6 -6.5,6 -5.111111,0 -6.5,0.320513 -6.5,1.5 0,1.151515 1.277778,1.5 5.5,1.5 5.5,0 5.5,0 5.5,6 0,6 0,6 -5.5,6 C 24,47 24,47 24,53.5 24,60 24,60 17.5,60 11,60 11,60 11,40 Z m 76,0 c 0,-21.00358 12.236215,-33.8302147 13.20228,-13.839318 0.29772,6.160683 0.29772,6.160683 4.61159,0 C 109.12774,20 109.12774,20 117.18631,20 c 6.28425,0 7.85049,0.275224 7.11349,1.25 -0.5198,0.6875 -3.75247,4.735864 -7.18371,8.996364 -3.94826,4.90247 -5.95657,8.206606 -5.47035,9 0.42255,0.6895 3.60012,5.274245 7.06126,10.188323 C 126.50892,60.511709 126.58772,60 117.08,60 c -7.92,0 -7.92,0 -12.48562,-7.25 -4.56561,-7.25 -4.56561,-7.25 -4.58,0 C 100,60 100,60 93.5,60 87,60 87,60 87,40 Z"
                    id="path2" />
                </g>
              </svg>
        </div>
        {/* Search input field */}
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            className={styles.inputText}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <Container>
        {/* Organization controls */}
        <div className={styles.partyControls}>
          {organizations.map((org) => (
            <Button key={org.id} onClick={() => toggleParty(org.name)}>
              {visibleParties[org.name] ? org.name : org.name}
            </Button>
          ))}
        </div>
        {/* Map Component */}
        <Map className={styles.homeMap} 
             center={DEFAULT_CENTER} 
             zoom={8}
             zoomControl={false}
             >
          {({ Marker, Popup, Tooltip }) => (
            <>
              {/* Display markers for each person / legal entity */}
              {filteredCandidates.map((person, index) => {
                const position = locations[person.id];
                const orgName = person.organization?.name;
                const socialLinks = socialMedia[person.id] || [];

                return position && visibleParties[orgName] ? (
                  <Marker 
                    key={index} 
                    position={position} 
                    icon={getIcon(person, orgName)}
                  >
                    <Tooltip>{person.name} - {orgName}</Tooltip>
                    <Popup>
                      <PersonCard person={person} orgName={orgName} socialLinks={socialLinks} />
                    </Popup>
                  </Marker>
                ) : null;
              })}
            </>
          )}
        </Map>
      </Container>
    </Layout>
  );
}
