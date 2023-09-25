export default function Attempts({attemptDetails}) {
    return(
        <div style={{ borderColor: attemptDetails.focus ? '#ffffff' : '#afcbdd'}} class="w-3/6 border-2 border-[#afcbdd]">
            <p class="inline-block text-white">{attemptDetails.value}</p>
        </div>
    )
}