# RAMPART
Read Assignment, Mapping, and Phylogenetic Analysis in Real Time

## Status
In development

## Installation
* [Install conda](https://conda.io/docs/user-guide/install/index.html)
* `git clone git@github.com:artic-network/rampart.git && cd rampart`
* `conda env create -f environment.yml`
* `source activate artic-rampart`
* `yarn` to install javascript / node-js packages (dependencies of the server and the frontend)


## How to Run

You'll need some way of creating reads - this can either be mocked or done in real-time using Albacore & the mapping daemon.
Either way creates files in `data/real_time_reads/`, which the server then reads and passes to the frontend.

#### Live mapping:
* start Albacore:

```
read_fast5_basecaller.py --resume -c r94_450bps_linear.cfg -i MinKNOW/data/reads/ -s basecalled_reads -o fastq -t 4 -r --barcoding -q 1000
```

* start mapping daemon:

```
scripts/read_mapping_daemon.py -r ../artic-ebov/reference_genomes/ebov-reference-genomes-10.fasta -n 1000 -m basecalled_reads/workspace/pass data/real_time_reads/
```

#### Mock basecalling & mapping (for debugging / computers without GPUs)

Step 1: Group ONT fast5 files into time slices for mapping (where `N` limits the number of FAST5 directories processed)

```
python scripts/split_fast5s_according_to_timestamps.py --n-stop N FAST5DIR TIME_SLICED_FAST5_DIR
```

Step 2: Basecall each of these time-sliced-fast5-directories using albacore

```
mkdir basecalled_time_slices && for i in $( ls time_sliced_fast5/ ); do mkdir basecalled_time_slices/${i}; read_fast5_basecaller.py -c r94_450bps_linear.cfg -i time_sliced_fast5/${i} -s basecalled_time_slices/${i} -o fastq -r --barcoding -q 1000 -t 3; done
```

Step 3: Map these FASTQs to a panel of reference sequences and produce a JSON per time slice

```
mkdir mapped_time_slices && for i in  $( ls basecalled_time_slices ); do mkdir mapped_time_slices/${i}; python ~/artic-network/rampart/scripts/read_mapping_daemon.py -r ~/artic-network/artic-ebov/reference_genomes/ebov-reference-genomes-10.fasta -i ~/artic-network/rampart/data/run_info.json -n 1000 --dont_observe basecalled_time_slices/${i}/workspace/pass mapped_time_slices/${i}; done

```

Step 4: To mimic steps 1-3 happening in real time, copy these JSONs into the RAMPRT-watched directory at some prescribed rate (60 would be pseudo-real-time)

```
python scripts/periodically_copy_mapped_jsons.py --rate 10 ~/reads/20180531_2057_EBOV/mapped_time_slices data/real_time_reads
```


### Start the server & frontend
* `npm run server &` which starts the server (to deliver reads)
* `npm run start` which starts the frontend (available at [http://localhost:3000/](http://localhost:3000/))
