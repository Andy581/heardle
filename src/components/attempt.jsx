export default function Attempts({ attemptDetails }) {
    return attemptDetails.map((attemptDetail) => {
        return (
            <div style={{ borderColor: attemptDetail.focus ? '#ffffff' : '#2d4358' }} class="w-3/6 border-2 border-[#afcbdd]">
                <p class="inline-block text-white">
                    {attemptDetail.value === 'Skipped' ? '❌ Skipped' : attemptDetail.value}</p>
            </div>
        )
    })
}