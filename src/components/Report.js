import React from 'react';
import {makeTimeFormatter} from "../utils/commonFunctions";

const TimeInfo = ({data}) => {
  const timeFormatter = makeTimeFormatter();
  const maxTime = Object.values(data).reduce((maxTime, sampleData) => {
    if (sampleData.temporal.length && sampleData.temporal[sampleData.temporal.length-1].time > maxTime) {
      return sampleData.temporal[sampleData.temporal.length-1].time;
    }
    return maxTime
  }, 0)
  return (
    <div>
      <div className="caption">Time Information</div>
      <div>{`Latest FASTQ indicates run time of ${timeFormatter(maxTime)}`}</div>
    </div>
  )
}

const CurrentCoverageStats = ({data, config}) => {
  const names = Object.keys(data).filter((name) => name!=="all");
  return (
    <table>
      <caption>Approx Genome Coverages</caption>
      <thead className="sideways">
        <tr>
          <th/>
          <th>10x</th>
          <th>100x</th>
          <th>1000x</th>
        </tr>
      </thead>
      <tbody>
        {names.map((name) => {
          if (!data[name].temporal.length) {
            return (
              <tr key={name}>
              <th>{name}</th>
            </tr>
            )
          }
          const temporalData = data[name].temporal[data[name].temporal.length-1];
          return (
            <tr key={name}>
              <th>{name}</th>
              <td>{temporalData.over10x + "%"}</td>
              <td>{temporalData.over100x + "%"}</td>
              <td>{temporalData.over1000x + "%"}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  );
}


const ReferenceMatches = ({data, config}) => {
  const refNames = config.referencePanel.map((r) => r.name);
  return (
    <table>
      <caption>Sample name - reference matches</caption>
      <thead className="sideways">
        <tr>
          <th key="space" className="rotate"></th>
          {refNames.map((refName) => (
            <th className="rotate" key={refName}><div><span>{refName}</span></div></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(data).filter((k) => k!=="all").map((name) => {
          return (
            <tr key={name}>
              <th key={"header"}>{name}</th>
              {refNames.map((refName) => {
                if (data[name].refMatches[refName]) {
                    const count = parseInt(data[name].refMatches[refName]);
                    const total = parseInt(data[name].refMatches['total']);
                    const percent = (100.0 * count) / total;
                  return (
                    <td key={refName}>
                      {`${percent.toFixed(2)}%`}
                    </td>
                  )
                }
                return (
                  <td key={refName}>-</td>
                )
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const ReadCounts = ({data, config}) => {
  const names = Object.keys(data);

  const getReadLengths = (readLengths) => {
    if (!readLengths.xyValues.length) {
      return {min: "NA", mode: "NA", max: "NA", median: "NA"};
    }
    /* must get rid of the 0 count entries, which are added for viz purposes */
    const xyVals = readLengths.xyValues.filter((xy) => xy[1]!==0);
    const min = xyVals[0][0];
    const max = xyVals[xyVals.length-1][0];
    const n = xyVals.reduce((pv, cv) => pv+cv[1], 0);
    const medianIdx = xyVals.reduce(
      (acc, cv, idx) => acc[1]>n/2 ? acc : [idx, acc[1] + cv[1]],
      [0, 0] // [0]: idx, [1]: total of counts seen thus far
    )[0];
    const mode = xyVals.reduce(
      (acc, cv) => acc[1] > cv[1] ? acc : cv,
      [0, 0] // [0]: x value with max count so far, [1]: max count so far
    );
    return {min: min+"bp", max: max+"bp", median: `${xyVals[medianIdx][0]}bp`, mode: `${mode[0]}bp (n=${mode[1]})`}
  }

  return (
    <table>
      <caption>Reads (rounded to 10bp)</caption>
      <thead className="sideways">
        <tr>
          <th/>
          <th>n(demuxed)</th>
          <th>n(mapped)</th>
          <th className="spaceLeft">Min Len</th>
          <th>Max Len</th>
          <th>Median</th>
          <th>Mode</th>
        </tr>
      </thead>
      <tbody>
        {names.map((name) => {
          const readLengths = getReadLengths(data[name].readLengths);
          return (
            <tr key={name}>
              <th>{name}</th>
              <td>{data[name].demuxedCount || 0}</td>
              <td>{data[name].mappedCount || 0}</td>
              <td className="spaceLeft">{readLengths.min}</td>
              <td>{readLengths.max}</td>
              <td>{readLengths.median}</td>
              <td>{readLengths.mode}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  );
}
const Report = ({dataPerSample, combinedData, config}) => {

  if (!config || !dataPerSample) {
    return (
      <div className="report">
        <h2>loading</h2>
      </div>
    )
  }

  return (
    <div className="report">
      <TimeInfo data={dataPerSample}/>
      <ReadCounts data={dataPerSample} config={config}/>
      <ReferenceMatches data={dataPerSample} config={config}/>
      <CurrentCoverageStats data={dataPerSample} config={config}/>

    </div>
  )

}



export default Report;


// data={data}
// referencePanel={config.referencePanel}