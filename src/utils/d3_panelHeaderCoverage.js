// import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { consensusCoverage, okCoverage } from "../magics";

export const renderCoverageHeatmap = (domRef, coverage) => {

  const selection = select(domRef);
  const dimensions = selection.node().getBoundingClientRect()
  console.log()

  const pxPerColumn = 3;
  const nIntervals = dimensions.width/pxPerColumn;
  const eachInterval = Math.floor(coverage.length / nIntervals);
  const columnIdxs = Array.from(new Array(nIntervals), (_, i) => i*eachInterval);

  const colourCoverage = (d) => {
    const depth = coverage[d];
    return depth > consensusCoverage ? "#252525" :
      depth > okCoverage ? "#636363" :
      depth > 10 ? "#969696" :
      "#cccccc";
  }

  selection
    .selectAll("*")
    .remove();

  selection
    .selectAll(".coverageCell")
    .data(columnIdxs)
    .enter().append("rect")
    .attr("class", "coverageCell")
    .attr('width', pxPerColumn)
    .attr('height', dimensions.height)
    .attr("x", (d, i) => pxPerColumn*i)
    .attr("y", 3)
    .attr("fill", colourCoverage);
  }
