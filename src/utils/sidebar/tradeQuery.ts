import type { Conqueror, JewelType } from "$lib/types";
import { conquerors } from "$lib/constants/timeless";

const MAX_FILTERS = 10;

function getConquerorName(conqueror: Conqueror): string {
  return conqueror.label.toLowerCase();
}

interface SeedRange {
  min: number;
  max: number;
}

function groupSeedsIntoRanges(seeds: number[]): SeedRange[] {
  if (seeds.length === 0) return [];

  const ranges: SeedRange[] = [];
  let rangeStart = seeds[0];
  let rangeEnd = seeds[0];

  for (let i = 1; i < seeds.length; i++) {
    if (seeds[i] === rangeEnd + 1) {
      rangeEnd = seeds[i];
    } else {
      ranges.push({ min: rangeStart, max: rangeEnd });
      rangeStart = seeds[i];
      rangeEnd = seeds[i];
    }
  }
  ranges.push({ min: rangeStart, max: rangeEnd });

  return ranges;
}

function getActualConquerors(
  jewelType: JewelType,
  conqueror: Conqueror | null,
): Conqueror[] {
  const jewelTypeConquerors = conquerors[jewelType.name];

  if (conqueror && conqueror.label !== "Any") {
    return [conqueror];
  }
  return jewelTypeConquerors.filter((c) => c.label !== "Any");
}

export function buildTradeQuery(
  seeds: number[],
  jewelType: JewelType,
  conqueror: Conqueror | null,
  page: number = 0,
): object {
  const actualConquerors = getActualConquerors(jewelType, conqueror);
  const numConquerors = actualConquerors.length;
  const filtersPerConqueror = Math.floor(MAX_FILTERS / numConquerors);

  const allRanges = groupSeedsIntoRanges(seeds);
  const totalPages = Math.ceil(allRanges.length / filtersPerConqueror);
  const currentPage = Math.min(page, totalPages - 1);
  const startRangeIdx = currentPage * filtersPerConqueror;
  const endRangeIdx = startRangeIdx + filtersPerConqueror;
  const pageRanges = allRanges.slice(startRangeIdx, endRangeIdx);

  const filters = actualConquerors.flatMap((c, i) => {
    const conquerorName = getConquerorName(c);
    const rangesForConqueror: SeedRange[] = [];
    pageRanges.forEach((range, j) => {
      if (j % numConquerors === i) {
        rangesForConqueror.push(range);
      }
    });
    return rangesForConqueror.map((range) => ({
      id: `explicit.pseudo_timeless_jewel_${conquerorName}`,
      value: { min: range.min, max: range.max },
    }));
  });

  return {
    query: {
      status: { option: "online" },
      stats: [
        {
          type: "count",
          value: { min: 1 },
          filters,
          disabled: false,
        },
      ],
    },
    sort: { price: "asc" },
  };
}

export function getSeedsPerPage(
  jewelType: JewelType,
  conqueror: Conqueror | null,
): number {
  const actualConquerors = getActualConquerors(jewelType, conqueror);
  const numConquerors = actualConquerors.length;
  return Math.floor(MAX_FILTERS / numConquerors);
}

export function getTotalPages(
  totalSeeds: number,
  jewelType: JewelType,
  conqueror: Conqueror | null,
): number {
  const allRanges = groupSeedsIntoRanges(
    [...Array(totalSeeds).keys()].map((i) => i + 1),
  );
  const filtersPerPage = getSeedsPerPage(jewelType, conqueror);
  return Math.ceil(allRanges.length / filtersPerPage);
}

export function getPageRange(
  seeds: number[],
  page: number,
  jewelType: JewelType,
  conqueror: Conqueror | null,
): { start: number; end: number } {
  const allRanges = groupSeedsIntoRanges(seeds);
  const filtersPerPage = getSeedsPerPage(jewelType, conqueror);
  const startRangeIdx = page * filtersPerPage;
  const endRangeIdx = startRangeIdx + filtersPerPage;
  const pageRanges = allRanges.slice(startRangeIdx, endRangeIdx);

  if (pageRanges.length === 0) {
    return { start: 0, end: 0 };
  }

  const start = pageRanges[0].min;
  const end = pageRanges[pageRanges.length - 1].max;

  return { start, end };
}

export function getPageRangeFromOrdered(
  orderedSeeds: number[],
  page: number,
  jewelType: JewelType,
  conqueror: Conqueror | null,
): { start: number; end: number; count: number } {
  const filtersPerPage = getSeedsPerPage(jewelType, conqueror);
  const startIdx = page * filtersPerPage;
  const endIdx = Math.min(startIdx + filtersPerPage, orderedSeeds.length);
  const count = endIdx - startIdx;

  if (count <= 0) {
    return { start: 0, end: 0, count: 0 };
  }

  return {
    start: orderedSeeds[startIdx],
    end: orderedSeeds[endIdx - 1],
    count,
  };
}
