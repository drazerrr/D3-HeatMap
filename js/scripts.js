const width = 1200;
const height = 500;
const padding = 60;
let req = new XMLHttpRequest();
let svg;
let legendsvg;
let legendscale;
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let values = [];
let legendColor = ['#33B8FF','#87CEEB','#EEDC5B','#638592','#9F2305'];

let legendRange = [-4, -3, -2, -1, 0, 1, 2, 3, 4]


const createLegend = () => {
    let legendsvg = d3.select('#legend')
             .append('svg')
             .attr('width', 300)
             .attr('height', 150)
       return legendsvg;      
};


const createLegendAxis = () => {
    let xLegendScale = d3.scaleLinear()
                         .domain([d3.min(legendRange, (d) => d), d3.max(legendRange, (d) => d)])
                         .range([10, 290]);
        return xLegendScale;                  
};

const createLegendScale = () => {
    return legendsvg.append('g')
             .call(d3.axisBottom(legendscale))
             .attr('transform', 'translate(0, 120)')

};


const createLegendBars = () => {
    return legendsvg.selectAll('rect')
                    .data(legendColor)
                    .enter()
                    .append('rect')
                    .attr('width', 280 / 9)
                    .attr('height', 30)
                    .attr('x', (d, i) => legendscale(legendRange[i + 2]))
                    .attr('y', 90)
                    .style('fill', (d) => d)
}



const createTitle = () => {
    return d3.select('main')
             .append('div')
             .attr('id', 'title')
             .text('Monthly Global Land-Surface Temperature')
};

const createDescription = () => {
    return d3.select('main')
             .append('div')
             .attr('id', 'description')
             .text('1753 - 2015: base temperature 8.66℃')
};

const createTooltip = () => {
    return d3.select('main')
    .append('div')
    .attr('id', 'tooltip');
};

const createSvg = () => {
    let svg = d3.select('main')
                .append('svg')
                .attr('width', width)
                .attr('height', height);
        
        return svg;        
}

const requestDataFromApi = (req) => {
    const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
    req.open('GET', url, true) // async
    
    return req;
};

const createScales = (data) => {
    const xScale = d3.scaleLinear()
                     .domain([d3.min(data, (d) => d.year), d3.max(data, (d) => d.year + 1)])
                     .range([padding, width - padding]);
                     
    const yScale = d3.scaleTime()
                     .domain([d3.min(data, (d) => new Date(00, (d.month -1), 00, 00, 00, 00)), d3.max(data, (d) => new Date(00, (d.month), 00, 00, 00, 00)) ])
                     .range([padding, height - padding]);
         
         return {xScale, yScale};            
};

const createAxis = (scales) => {

    svg.append('g')
       .call(d3.axisBottom(scales.xScale).tickFormat(d3.format('d')))
       .attr('id', 'x-axis')
       .attr('transform', 'translate(0, ' + (height - padding) +')');

       svg.append('g')
          .call(d3.axisLeft(scales.yScale).tickFormat(d3.timeFormat('%B')))
          .attr('id', 'y-axis')
          .attr('transform', 'translate('+ padding +', 0)')

};

const createGraph = (data, scales) => {
    return svg.selectAll('rect')
              .data(data)
              .enter()
              .append('rect')
              .attr('class', 'cell')
              .attr('width', (width - (padding * 2))/ (d3.max(data, (d) => d.year) - d3.min(data, (d) => d.year)))
              .attr('height', (height - (padding * 2)) / 12)
              .attr('x', (d) => scales.xScale(d.year))
              .attr('y', (d) => scales.yScale(new Date(00, (d.month -1), 00, 00, 00, 00)))
              .attr('fill', (d) => d.variance < -1 ? '#33B8FF' : d.variance < 0 ? '#87CEEB' : d.variance === 0 || d.variance < 1 ? '#EEDC5B' :  d.variance === 2 || d.variance > 2 ? '#638592' : '#9F2305')
              .attr('data-year', (d) => d.year)
              .attr('data-month', (d) => d.month -1)
              .attr('data-temp', (d) => d.variance)
              .on('mouseover', (e, d) => {
                let value = (8.66 + d.variance).toString().split('');
                let beta = value.indexOf('.');
                let temp = value.slice(0, beta + 2).join('');
                let vari = d.variance.toString().split('');
                let b;
                 d.variance < 0 ? b = vari.slice(0, 4).join('') : b = '+' + vari.slice(0, 3).join('');   
                d3.select('#tooltip')
                  .style('opacity', 0.85)
                  .style('left', e.pageX + 6 + 'px')
                  .style('top', e.pageY + 'px')
                  .html(`<p>${d.year} - ${months[d.month - 1]}</p><p>${temp}℃</p><p>${b}℃</p>`)
                  .attr('data-year', d.year)
            })
            .on('mouseout', () => {
                return d3.select("#tooltip")
                         .style('opacity', 0)
                         .style('left', 0)
                         .style('top', 0)
            })

}


req.onload = () => {
    values = JSON.parse(req.responseText);
    let data = values['monthlyVariance'];
    let scales = createScales(data);
    createAxis(scales);
    createGraph(data, scales);
}





const driver = () => {

    createTitle();
    createDescription();
    createTooltip();
    svg = createSvg();
    req =  requestDataFromApi(req);
    req.send();
    legendsvg =  createLegend();
    legendscale =  createLegendAxis();
    createLegendScale();
    createLegendBars();
};

driver();