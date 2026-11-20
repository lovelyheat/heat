export interface FilmEntry {
  title: string;
  year: string;
  rating: string;
  director?: string;
  href?: string;
  poster?: string;
}

export interface TrackEntry {
  title: string;
  artist: string;
  album: string;
  duration: string;
  isPlaying?: boolean;
  url?: string;
  image?: string;
}
