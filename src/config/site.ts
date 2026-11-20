import type { FilmEntry, TrackEntry } from "@/types";

export type { FilmEntry, TrackEntry };

export const siteConfig = {
  name: "heat",
  url: "https://heat.rest",
  discordUserId: "511514178788392990",
  socials: {
    x: {
      name: "Twitter",
      displayName: "heat",
      handle: "@rtnangl",
      href: "https://x.com/rtnangl",
      caption: "",
      avatar: "/x/avatar.jpg",
      banner: "/x/banner.jpg",
    },
    letterboxd: {
      name: "Letterboxd",
      handle: "lovelyheat",
      href: "https://letterboxd.com/lovelyheat",
      filmsLogged: null as number | null,
      recentFilms: [
        {
          title: "The Invite",
          year: "2026",
          rating: "★★★½",
          href: "https://letterboxd.com/lovelyheat/film/the-invite-2026/",
          poster:
            "https://a.ltrbxd.com/resized/film-poster/8/5/4/8/3/1/854831-the-invite-2026-0-600-0-900-crop.jpg?v=ee72905e48",
        },
        {
          title: "Other Mommy",
          year: "2026",
          rating: "★★½",
          href: "https://letterboxd.com/lovelyheat/film/other-mommy/",
          poster:
            "https://a.ltrbxd.com/resized/film-poster/1/2/8/4/4/8/0/1284480-other-mommy-0-600-0-900-crop.jpg?v=297427826f",
        },
        {
          title: "The Hunger Games",
          year: "2012",
          rating: "★★★",
          href: "https://letterboxd.com/lovelyheat/film/the-hunger-games/",
          poster:
            "https://a.ltrbxd.com/resized/sm/upload/x3/tw/wu/z4/vAkjFEm76Lu5hSevquxPgQ91OtI-0-600-0-900-crop.jpg?v=f4bfaf16df",
        },
        {
          title: "Resident Evil",
          year: "2026",
          rating: "★★★½",
          href: "https://letterboxd.com/lovelyheat/film/resident-evil-2026/",
          poster:
            "https://a.ltrbxd.com/resized/film-poster/1/3/0/2/7/1/7/1302717-untitled-resident-evil-reboot-0-600-0-900-crop.jpg?v=a688bf1bc7",
        },
      ] satisfies FilmEntry[],
    },
    lastfm: {
      name: "Last.fm",
      handle: "lovelyheat",
      href: "https://www.last.fm/user/lovelyheat",
      scrobbles: null as string | null,
      fallbackTrack: {
        title: "4ÆM",
        artist: "Grimes",
        album: "Miss Anthropocene",
        duration: "4:31",
        isPlaying: false,
        url: "https://www.last.fm/user/lovelyheat",
        image:
          "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/42/09/05/42090506-501e-1311-bd53-680a3f73c113/191400023659.png/300x300bb.jpg",
      } satisfies TrackEntry,
      recentRotation: [
        {
          title: "Kerosene",
          artist: "Crystal Castles",
          album: "(III)",
          duration: "3:12",
          image:
            "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/af/c2/0c/afc20cde-17b5-2002-7a40-f28536312089/5400863128418_cover.jpg/300x300bb.jpg",
        },
        {
          title: "Be Quiet and Drive",
          artist: "Deftones",
          album: "Around the Fur",
          duration: "5:08",
          image:
            "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/27/cb/b4/27cbb40e-f8c6-dede-9c69-62089a873fa9/093624919803.jpg/300x300bb.jpg",
        },
        {
          title: "Genesis",
          artist: "Justice",
          album: "Cross",
          duration: "3:54",
          image:
            "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/62/e4/01/62e40187-e672-17e5-f31f-9aee262703a3/mzi.bifzeufu.jpg/300x300bb.jpg",
        },
      ] satisfies TrackEntry[],
    },
    discord: {
      name: "Discord",
      handle: "lovelyheat",
      displayTag: "@lovelyheat",
      href: "https://discord.com/users/511514178788392990",
    },
    github: {
      name: "GitHub",
      handle: "GitHub",
      href: "https://github.com/lovelyheat",
    },
  },
  year: "2026",
} as const;
