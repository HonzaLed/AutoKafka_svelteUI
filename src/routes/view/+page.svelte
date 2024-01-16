<script>
    import { onMount } from "svelte";
    import Youtube from "svelte-youtube-embed";
    import Accordion from 'stwui/accordion';

    /** @type {String|null} */
    let video_id;
    /** @type {String} */
    let video_url;
    /** @type {String} */
    let embed_url;

    /** @type {{answers: String, transcript: String, language: String, video_info: {title: String, author_name:String, type:String, height:Number, width:Number, version:String, provider_name:String, provider_url:String, thumbnail_height:Number, thumbnail_width:Number, thumbnail_url:String, html:String, description:String}, video_url:String }} */
    let video_data;

    /** @type {String[]} */
    let answers = ["Loading..."];
    /** @type {String} */
    let transcript = "Loading...";
    /** @type {String} */
    let video_title = "Loading...";

    async function fetch_from_api() {
        let response = await fetch("https://api.cernyrob.in/kafka/get?video_url="+video_url);
        let data = await response.json();
        if (data.code !== 200 || data.message !== "OK") {
            throw new Error("API returned an error: " + data.message);
        }
        video_data = data.data;
        transcript = video_data.transcript.trim();
        video_title = video_data.video_info.title;
    }

    async function parse_data() {
        answers = video_data.answers.trim().split("\r\n");
        for (let i=0; i<answers.length; i++) {
            let index = answers[i].search(" ");
            if (index < 0) return;
            answers[i]=answers[i].substring(0, index)+"</span>"+answers[i].substring(index);
            answers[i]="<span class=\"font-bold text-[#163564] dark:text-[#8D94BA]\">"+answers[i];
        }
    }

    onMount(async () => {
        // @ts-ignore
        video_id = new URL(window.location).searchParams.get("videoid");
        if (video_id===null) {
            console.error("No video id!");
            window.location.href = "/error"
        }
        video_url = "https://www.youtube.com/watch?v="+ video_id;
        embed_url = "https://www.youtube.com/embed/"  + video_id;
        console.log(video_id);
        await fetch_from_api()
        await parse_data();
    });

    let accordion_open = "odpovedi";
    /**
	 * @param {string} item
	 */
    function handle_accordion(item) {
        if (item===accordion_open) {
            accordion_open=""
        } else {
            accordion_open=item
        }
    }
</script>


<div class="flex justify-center items-center h-screen bg-white dark:bg-slate-950">
    <div class="grow self-center text-center max-w-[40%] p-2">
        <h1 class="text-3xl font-bold mb-4 text-[#1B4079] dark:text-[#A0CFD3]">
            {video_title}
        </h1>
        <Youtube id={video_id} />
    </div>
    <div class="grow self-center max-w-[60%] p-2">
        <Accordion>
            <Accordion.Item open={accordion_open==="odpovedi"}>
        <!-- <h1 class="text-3xl font-bold mb-4 text-center text-[#1B4079] dark:text-[#A0CFD3]"> -->
                <Accordion.Item.Title slot="title" on:click={()=>{handle_accordion("odpovedi")}}>Odpovědi</Accordion.Item.Title>
        <!-- </h1> -->
                <Accordion.Item.Content slot="content">
                    {#each answers as i}
                        <p class="leading-6 text-black dark:text-white">{@html i}</p>
                    {/each}
                </Accordion.Item.Content>
            </Accordion.Item>
            <Accordion.Item open={accordion_open==="transcript"}>
                <Accordion.Item.Title slot="title" on:click={()=>{handle_accordion("transcript")}}>Transcript</Accordion.Item.Title>
                <Accordion.Item.Content slot="content">
                    <div class="overflow-y-scroll max-h-[28rem] dark:text-white">
                        {transcript}
                    </div>
                </Accordion.Item.Content>
            </Accordion.Item>
        </Accordion>
    </div>
</div>