export default function GameBar({ duration, songBar }) {
    return (
        <div className="Bar" class="w-full border h-5">
            <div className="PotentialBar" style={{ width: duration / 16.0 * 100 + '%' }} class="bg-[#505050] h-6" />
            <div className="ActualBar" style={{ width: songBar.width / 16.0 * 100 + '%', transitionDuration: songBar.duration + 's' }} class="bg-blue-600 h-6 transition-all ease-linear -my-6" >
            </div>
            {/* <div className="ProgressBar" class="-my-6 grid grid-cols-16 divide-x-6">
                <div className="Section" class="border-r-2 border-rose-500"/>
                <div className="Section" class="border-r-2 border-rose-500"> 02</
                <div className="Section" class="border-r-2 border-rose-500 col-span-2"> 03</div>
                <div className="Section" class="border-r-2 border-rose-500 col-span-3"> 04</div>
                <div className="Section" class="border-r-2 border-rose-500 col-span-4"> 05</div>
                <div className="Section" class="border-r-2 border-rose-500 col-span-5"> 06</div>
            </div> */}
        </div>
    )

}
