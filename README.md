# 🍃 FarRight Map Germany #

> A map application that visualizes far-right activities using Next.js and Leaflet.

[![React](https://img.shields.io/badge/React-blue.svg)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-blue.svg)](https://nextjs.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-blue.svg)](https://leafletjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-blue.svg)](https://www.sqlite.org/index.html)
[![AGPL-3.0](https://img.shields.io/badge/License-AGFL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html)

<img src="https://raw.githubusercontent.com/Scobiform/farright-map/f13cd587aa48b9ab660ee26b04894cb0be1a4d15/public/favicon.svg" alt="farright-map screenshot" style="width: 100%;align: right;" />

## Table of Contents ##

- [Disclaimer](#disclaimer)
- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Disclaimer ##

All data used in this project was publicly available.

## Background ##

This project is designed to map far-right party-candidates, media, organizations, special locations, fraternities and settlers (yes, Germany has "völkische SIedler*innen"). The data was exclusively collected from open sources and is in public interest.

## Install ##

First, clone the repository or use the following command to create a Next.js app based on this template:

```bash
npx create-next-app -e https://github.com/Scobiform/farright-map
```

## Usage ##

Second, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### API routes can be accessed on

- [/api/organization](http://localhost:3000/api/organization)
- [/api/person](http://localhost:3000/api/person)
- [/api/person/1](http://localhost:3000/api/person/1)
- [/api/location](http://localhost:3000/api/location)
- [/api/location?personId=133](http://localhost:3000/api/location?personId=133)
- [/api/location?organizationId=1](http://localhost:3000/api/location?organizationId=1)
- [/api/socialmedia](http://localhost:3000/api/socialmedia)
- [/api/socialmedia/1](http://localhost:3000/api/socialmedia/1)
- [/api/personAttributes?personId=133](http://localhost:3000/api/personAttributes?personId=133)


## Maintainers ##

[@Scobiform](https://github.com/Scobiform/)

## Contributing ##

Feel free to contribute to this project.

- [Project Kanban Board](https://github.com/users/Scobiform/projects/8)
- [Discussions](https://github.com/Scobiform/farright-map/discussions)
- [Issues](https://github.com/Scobiform/farright-map/issues)

## License ##

- AGPL-3.0
