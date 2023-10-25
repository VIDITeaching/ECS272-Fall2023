<script lang="ts">
import * as d3 from "d3";
import Data from '../../data/ds_salaries.json'; 
import axios from 'axios';
import { isEmpty, debounce, method } from 'lodash';
import { createHydrationRenderer } from "vue";
